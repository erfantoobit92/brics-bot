import TelegramBot, { Message } from "node-telegram-bot-api";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// --- متغیرهای جدید از .env ---
const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;
const bricsApiUrl = process.env.MAIN_API_URL;
const botSecret = process.env.BOT_SECRET;

if (!token || !webAppUrl || !bricsApiUrl || !botSecret) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN, WEB_APP_URL, BRICS_API_URL, and BOT_SECRET must be set in .env file"
  );
}

const bot = new TelegramBot(token, { polling: true });

// --- منطق /start شما (بدون تغییر) ---
bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;
  const startParam = msg.text ? msg.text.split(" ")[1] : undefined;

  let finalWebAppUrl = webAppUrl;
  if (startParam) {
    const separator = webAppUrl.includes("?") ? "&" : "?";
    finalWebAppUrl = `${webAppUrl}${separator}ref=${startParam}`;
  }
  let welcomeMessage;
  // ... (بقیه منطق پیام خوش‌آمدگویی و دکمه)
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
            text: "💰 Launch Brics Trade /",
            web_app: { url: finalWebAppUrl },
          },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, welcomeMessage, options);
});

// --- منطق جدید برای گوش دادن به استوری‌های فوروارد شده ---
bot.on("message", async (msg: any) => {
  // 1. اول چک می‌کنیم که آیا این یک پیام فوروارد شده هست یا نه
  // و آیا فرستنده، همون نویسنده اصلی استوری هست

  console.log("@@@@@", msg);

  if (
    msg.from &&
    msg.story &&
    msg.chat &&
    msg.story.chat.id === msg.from.id &&
    msg.from.id === msg.chat.id
  ) {
    const forwarderId = msg.from.id;

    console.log(`Received a story forward from user ${forwarderId}`);

    try {
      // 2. یک درخواست به API بک‌اند می‌زنیم تا جایزه رو ثبت کنه
      const response = await axios.post(
        `${bricsApiUrl}/tasks/internal/complete-story-from-bot`,
        {
          telegramId: forwarderId,
        },
        {
          headers: {
            "x-bot-secret": botSecret,
          },
        }
      );

      console.log(
        `Backend notified successfully for user ${forwarderId}`,
        response.data
      );

      // 3. به کاربر پیام موفقیت‌آمیز می‌دیم
      await bot.sendMessage(
        msg.chat.id,
        "✅ Your story has been verified! The reward has been added to your account."
      );
    } catch (error: any) {
      console.error(
        "Error processing forwarded story:",
        error.response ? error.response.data : error.message
      );

      // 4. به کاربر پیام خطا می‌دیم
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again or contact support.";

      await bot.sendMessage(msg.chat.id, `😕 Oops! ${errorMessage}`);
    }
  }
});

console.log("Bot server is running and listening for all messages...");
