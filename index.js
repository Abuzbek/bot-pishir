require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const { createClient } = require("@supabase/supabase-js");

// 1. Setup Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 2. Setup Bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// A. Trigger: Web App asks to verify
bot.on("message", async (ctx, next) => {
  if (ctx.message.web_app_data?.data === "REQUEST_PHONE") {
    await ctx.reply(
      "To verify your account, please share your phone number:",
      Markup.keyboard([Markup.button.contactRequest("📱 Share Phone Number")])
        .resize()
        .oneTime()
    );
  }
  return next();
});

// B. Result: User shares contact
bot.on("contact", async (ctx) => {
  const contact = ctx.message.contact;

  if (contact.user_id !== ctx.from.id) {
    return ctx.reply("Please share your own contact.");
  }

  console.log(`Received phone: ${contact.phone_number}`);

  // Save to Supabase
  const { error } = await supabase.from("telegram_users").upsert({
    id: contact.user_id,
    phone_text: contact.phone_number,
    updated_at: new Date(),
  });

  if (error) {
    console.error("DB Error:", error);
    return ctx.reply("System error saving your number.");
  }

  await ctx.reply(
    "✅ Success! Your phone number is verified.",
    Markup.removeKeyboard()
  );
});

console.log("Bot is starting...");
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
