"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { sendContactFormNotificationEmail } from "@/lib/email";
import { SUPER_ADMIN_EMAIL, Role } from "@/lib/constants";
import { requireRole } from "@/lib/auth";

const ContactSchema = z.object({
  name: z.string().min(2, "Name is required").trim(),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  subject: z.string().min(3, "Subject is required").trim(),
  message: z.string().min(10, "Message must be at least 10 characters").trim(),
});

export async function submitContactMessageAction(rawInput: unknown) {
  try {
    const parseResult = ContactSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.errors[0].message };
    }

    const { name, email, subject, message } = parseResult.data;
    await connectToDatabase();

    await ContactMessage.create({
      name,
      email,
      subject,
      message,
      read: false,
    });

    // Notify super admin
    await sendContactFormNotificationEmail(
      SUPER_ADMIN_EMAIL,
      name,
      email,
      subject,
      message
    );

    return {
      success: true,
      message: "Thank you! Your message has been sent. We will get back to you shortly.",
    };
  } catch (err: unknown) {
    console.error("submitContactMessageAction error:", err);
    return {
      success: false,
      error: "Failed to send your message. Please try again later.",
    };
  }
}

export async function markContactMessageReadAction(id: string, readStatus = true) {
  try {
    await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
    await connectToDatabase();

    await ContactMessage.findByIdAndUpdate(id, { read: readStatus });
    revalidatePath("/dashboard/messages");

    return { success: true };
  } catch (err: unknown) {
    console.error("markContactMessageReadAction error:", err);
    return { success: false, error: "Failed to update message status." };
  }
}
