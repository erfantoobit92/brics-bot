import TelegramBot, { Message } from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL; // آدرس فرانت‌اند شما

if (!token || !webAppUrl) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN and WEB_APP_URL must be set in .env file"
  );
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;
  const startParam = msg.text ? msg.text.split(" ")[1] : undefined;

  // --- تغییر اصلی اینجاست ---
  let finalWebAppUrl = webAppUrl;

  // اگر پارامتر رفرال وجود داشت، اون رو به URL اضافه کن
  if (startParam) {
    // مطمئن میشیم که URL قبلاً پارامتری نداشته باشه
    const separator = webAppUrl.includes("?") ? "&" : "?";
    finalWebAppUrl = `${webAppUrl}${separator}ref=${startParam}`;
  }

  console.log(`Final Web App URL: ${finalWebAppUrl}`); // برای دیباگ

  let welcomeMessage: string;

  // اگر با لینک رفرال اومده
  if (startParam) {
    welcomeMessage = `
🎉 **Welcome to Brics Trade!** 🎉

You've been invited by a friend! Tap the button below **right now** to claim your welcome bonus and start playing.

Don't wait, your bonus is ready!
    `;
  }
  // اگر مستقیم اومده
  else {
    welcomeMessage = `
🚀 **Welcome to Brics Trade!** 🚀

Ready to start earning? Tap the button below to launch the app and begin your journey.

Good luck!
    `;
  }

  const options: TelegramBot.SendMessageOptions = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💰 Launch Brics Trade",
            // از URL نهایی و دینامیک استفاده می‌کنیم
            web_app: { url: finalWebAppUrl },
          },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, welcomeMessage, options);
});

console.log("Bot server is running...");
