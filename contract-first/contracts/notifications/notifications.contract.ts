/**
 * Notifications API — polymorphic contract example.
 *
 * Demonstrates:
 *   - z.discriminatedUnion() for channel-specific notification types
 *   - Shared base fields + channel-specific fields
 *   - OpenAPI discriminator generation (oneOf + propertyName)
 *   - Deferred cases for APIs that don't exist yet (design-first)
 *
 * This API does not exist — contracts declare intent, not implementation.
 * Run `glubean_openapi` or `glubean_extract_contracts` to generate specs.
 */
import { z } from "zod";
import { contract } from "@glubean/sdk";
import { notificationsApi } from "../../config/notifications-api.ts";

const notifications = contract.http.with("notifications", {
  client: notificationsApi,
});

// ── Channel-specific schemas ───────────────────────────────────────────────

const EmailNotification = z.object({
  channel: z.literal("email"),
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  cc: z.array(z.string().email()).optional(),
});

const SmsNotification = z.object({
  channel: z.literal("sms"),
  phone: z.string(),
  message: z.string(),
});

const PushNotification = z.object({
  channel: z.literal("push"),
  deviceToken: z.string(),
  title: z.string(),
  body: z.string(),
  badge: z.number().optional(),
  data: z.record(z.string(), z.string()).optional(),
});

// ── Discriminated union ────────────────────────────────────────────────────

const NotificationPayload = z.discriminatedUnion("channel", [
  EmailNotification,
  SmsNotification,
  PushNotification,
]);

// ── Response schemas ───────────────────────────────────────────────────────

const SendResponseSchema = z.object({
  id: z.string().uuid(),
  channel: z.enum(["email", "sms", "push"]),
  status: z.enum(["queued", "sent", "failed"]),
  createdAt: z.string().datetime(),
});

const NotificationDetailSchema = z.object({
  id: z.string().uuid(),
  channel: z.enum(["email", "sms", "push"]),
  status: z.enum(["queued", "sent", "delivered", "failed", "bounced"]),
  payload: NotificationPayload,
  createdAt: z.string().datetime(),
  deliveredAt: z.string().datetime().optional(),
  failureReason: z.string().optional(),
});

const NotificationListSchema = z.object({
  notifications: z.array(NotificationDetailSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

// ── Send notification ──────────────────────────────────────────────────────

// @contract
export const sendNotification = notifications("send-notification", {
  endpoint: "POST /notifications",
  feature: "Notification Delivery",
  description: "Send a notification through any supported channel",
  request: NotificationPayload,
  cases: {
    email: {
      description: "Send an email notification with subject and body",
      body: {
        channel: "email",
        to: "user@example.com",
        subject: "Your order has shipped",
        body: "Track your package at ...",
      },
      expect: { status: 201, schema: SendResponseSchema },
      deferred: "API not implemented yet",
    },
    sms: {
      description: "Send an SMS notification to a phone number",
      body: {
        channel: "sms",
        phone: "+1234567890",
        message: "Your verification code is 123456",
      },
      expect: { status: 201, schema: SendResponseSchema },
      deferred: "API not implemented yet",
    },
    push: {
      description: "Send a push notification to a mobile device",
      body: {
        channel: "push",
        deviceToken: "abc123",
        title: "New message",
        body: "You have a new message from Alice",
        badge: 1,
      },
      expect: { status: 201, schema: SendResponseSchema },
      deferred: "API not implemented yet",
    },
    invalidChannel: {
      description: "Unknown channel type is rejected with validation error",
      body: { channel: "fax", message: "hello" },
      expect: { status: 422 },
      deferred: "API not implemented yet",
    },
  },
});

// ── Get notification detail ────────────────────────────────────────────────

// @contract
export const getNotification = notifications("get-notification", {
  endpoint: "GET /notifications/:id",
  feature: "Notification Tracking",
  description: "Show a notification's delivery outcome and message content",
  cases: {
    delivered: {
      description: "Delivered notification shows when it arrived and what was sent",
      pathParams: { id: "550e8400-e29b-41d4-a716-446655440000" },
      expect: { status: 200, schema: NotificationDetailSchema },
      deferred: "API not implemented yet",
    },
    failed: {
      description: "Failed notification includes failure reason",
      pathParams: { id: "550e8400-e29b-41d4-a716-446655440001" },
      expect: { status: 200, schema: NotificationDetailSchema },
      deferred: "API not implemented yet",
    },
    notFound: {
      description: "Unknown notification id is reported as missing",
      pathParams: { id: "00000000-0000-0000-0000-000000000000" },
      expect: { status: 404 },
      deferred: "API not implemented yet",
    },
  },
});

// ── List notifications ─────────────────────────────────────────────────────

// @contract
export const listNotifications = notifications("list-notifications", {
  endpoint: "GET /notifications",
  feature: "Notification Tracking",
  description: "List notifications with pagination, filterable by channel and status",
  cases: {
    defaultPage: {
      description: "Returns first page of all notifications",
      expect: { status: 200, schema: NotificationListSchema },
      deferred: "API not implemented yet",
    },
    filterByChannel: {
      description: "Filter notifications by delivery channel",
      query: { channel: "email" },
      expect: { status: 200, schema: NotificationListSchema },
      deferred: "API not implemented yet",
    },
  },
});
