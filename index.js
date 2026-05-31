require("dotenv").config();

const fs = require("fs");
const express = require("express");
const { Telegraf, Markup } = require("telegraf");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const PORT = process.env.PORT || 10000;
const ADMIN_ID = 5523761749;

const CHANNELS = [
  "@vaelux",
  "@idrokium"
];

const USERS_FILE = "users.json";

// ===== USERS =====

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE));
  } catch {
    return [];
  }
}

function saveUser(userId) {
  const users = getUsers();

  if (!users.includes(userId)) {
    users.push(userId);
    fs.writeFileSync(
      USERS_FILE,
      JSON.stringify(users, null, 2)
    );
  }
}

// ===== CHECK SUB =====

async function isSubscribed(userId) {
  try {
    for (const channel of CHANNELS) {
      const member = await bot.telegram.getChatMember(
        channel,
        userId
      );

      const allowed = [
        "creator",
        "administrator",
        "member"
      ];

      if (!allowed.includes(member.status)) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// ===== JOIN MESSAGE =====

async function sendJoinMessage(ctx) {
  return ctx.reply(
`🎯 Assalomu alaykum!

IELTS natijangizni keyingi bosqichga olib chiqishga tayyormisiz?

📚 Eng foydali materiallar
📝 Real testlar
🚀 Tezkor rivojlanish uchun maxsus platformamizdan foydalanishdan oldin quyidagi kanallarga a'zo bo'ling.

👇 A'zolikni tasdiqlang va imkoniyatni qo'ldan boy bermang.`,
    Markup.inlineKeyboard([
      [
        Markup.button.url(
          "📢 Vaelux",
          "https://t.me/vaelux"
        )
      ],
      [
        Markup.button.url(
          "📢 Idrokium",
          "https://t.me/idrokium"
        )
      ],
      [
        Markup.button.callback(
          "✅ Tekshirish",
          "check_sub"
        )
      ]
    ])
  );
}

// ===== SUCCESS =====

async function sendSuccessMessage(ctx) {
  return ctx.reply(
`🔥 Ajoyib!

Siz endi yopiq imkoniyatlarga kirish huquqini qo'lga kiritdingiz.

🎓 Minglab IELTS o'quvchilari foydalanayotgan platformada:

✅ Real IELTS savollari
✅ Daily Practice
✅ AI yordamchi
✅ IELTS 8+ strategiyalari
✅ Tez va qulay tayyorgarlik

🏆 Katta konkurs ham yaqin kunlarda boshlanadi!

🎁 Faol foydalanuvchilar uchun maxsus sovg'alar va bonuslar tayyorlanmoqda.

👇 Hozirning o'zida platformaga o'ting.`,
    Markup.inlineKeyboard([
      [
        Markup.button.url(
          "🚀 Bepul Tayyorlanishni Boshlash",
          "https://english.onrender.com"
        )
      ]
    ])
  );
}

// ===== START =====

bot.start(async (ctx) => {
  saveUser(ctx.from.id);

  const subscribed = await isSubscribed(
    ctx.from.id
  );

  if (!subscribed) {
    return sendJoinMessage(ctx);
  }

  return sendSuccessMessage(ctx);
});

// ===== CHECK BUTTON =====

bot.action("check_sub", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    const subscribed =
      await isSubscribed(ctx.from.id);

    if (!subscribed) {
      return sendJoinMessage(ctx);
    }

    return sendSuccessMessage(ctx);
  } catch (err) {
    console.error(err);
  }
});

// ===== USERS =====

bot.command("users", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const users = getUsers();

  await ctx.reply(
    `👥 Jami foydalanuvchilar: ${users.length}`
  );
});

// ===== BROADCAST =====

bot.command("xabar", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const text = ctx.message.text
    .replace("/xabar", "")
    .trim();

  if (!text) {
    return ctx.reply(
`❌ Xabar kiriting

Misol:
/xabar Konkurs ertaga boshlanadi 🚀`
    );
  }

  const users = getUsers();

  let sent = 0;
  let failed = 0;

  await ctx.reply(
    `📤 ${users.length} ta foydalanuvchiga yuborilmoqda...`
  );

  for (const userId of users) {
    try {
      await bot.telegram.sendMessage(
        userId,
        text
      );

      sent++;
    } catch {
      failed++;
    }
  }

  await ctx.reply(
`✅ Yakunlandi

📨 Yuborildi: ${sent}
❌ Xatolik: ${failed}`
  );
});

// ===== EXPRESS =====

app.get("/", (req, res) => {
  res.send(
    "English Konkurs Bot is running 🚀"
  );
});

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

// ===== START BOT =====

bot.launch()
  .then(() => {
    console.log("Bot started 🚀");
  })
  .catch(console.error);

// ===== STOP =====

process.once("SIGINT", () =>
  bot.stop("SIGINT")
);

process.once("SIGTERM", () =>
  bot.stop("SIGTERM")
);