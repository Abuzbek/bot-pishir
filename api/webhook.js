// api/webhook.js
const { Telegraf, Markup } = require("telegraf");

// Initialize bot using the token from environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);

// --- YOUR BOT LOGIC ---
bot.on("message", async (ctx) => {
  // Check for the Web App data trigger
  if (ctx.message.web_app_data?.data === "REQUEST_PHONE") {
    await ctx.reply(
      "Please share your phone number:",
      Markup.keyboard([Markup.button.contactRequest("📱 Share Phone Number")])
        .resize()
        .oneTime()
    );
  }
  // Handle the Contact share
  else if (ctx.message.contact) {
    const contact = ctx.message.contact;
    if (contact.user_id === ctx.from.id) {
      // TODO: Save to Supabase here (copy your supabase code here)
      await ctx.reply("✅ Phone Saved!", Markup.removeKeyboard());
    } else {
      await ctx.reply("Please share your own contact.");
    }
  }
});

// --- THE VERCEL HANDLER ---
// This function tells Vercel: "When a request comes in, let Telegraf handle it"
module.exports = async (req, res) => {
  try {
    // 1. Handle the update from Telegram
    await bot.handleUpdate(req.body);

    // 2. Respond to Telegram that we got it (otherwise they keep retrying)
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }
};
