import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

// 🔐 CONFIG
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const LEADER_ROLE_ID = process.env.LEADER_ROLE_ID;

// 🎖️ CARGOS
const ROLE_MEDICO = "1477683902079303934";
const ROLE_HP = "1477683902079303932";

// 📌 CANAIS
const ANALISE_CHANNEL = "1497304750214090846";
const PRONTUARIO_CHANNEL = "1495178025602515177";

const DISCORD_LINK = "https://discord.gg/SEULINK";

// 🤖 BOT
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// 📌 COMANDOS
const commands = [
  new SlashCommandBuilder()
    .setName("hospital")
    .setDescription("Abrir painel do Hospital HP")
    .toJSON()
];

// 🚀 REGISTRO
const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
  console.log(`🤖 Online: ${client.user.tag}`);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
});

// =========================
// 📌 PAINEL PRINCIPAL
// =========================
client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "hospital") {

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🏥 HOSPITAL HP - CENTRAL")
        .setDescription(
`Bem-vindo ao sistema do Hospital.

Selecione uma opção abaixo para continuar:

📌 Recrutamento
📊 Status
📩 Informações`
        );

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("menu_hospital")
          .setPlaceholder("Escolha uma opção")
          .addOptions([
            {
              label: "Recrutamento",
              value: "recrutamento",
              description: "Entrar para equipe médica"
            },
            {
              label: "Status",
              value: "status",
              description: "Ver status do seu pedido"
            },
            {
              label: "Informações",
              value: "info",
              description: "Sobre o hospital"
            }
          ])
      );

      return interaction.reply({
        embeds: [embed],
        components: [menu]
      });
    }
  }

  // =========================
  // 📌 MENU
  // =========================
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "menu_hospital") {

      const value = interaction.values[0];

      // ===== RECRUTAMENTO =====
      if (value === "recrutamento") {

        const embed = new EmbedBuilder()
          .setColor("#22c55e")
          .setTitle("📋 RECRUTAMENTO HP")
          .setDescription("Clique abaixo para se candidatar ao hospital.");

        const btn = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("start_apply")
            .setLabel("Iniciar Cadastro")
            .setStyle(ButtonStyle.Success)
        );

        return interaction.reply({
          embeds: [embed],
          components: [btn],
          flags: 64
        });
      }

      // ===== INFO =====
      if (value === "info") {
        return interaction.reply({
          content: "🏥 Hospital HP atua salvando vidas no RP.",
          flags: 64
        });
      }

      // ===== STATUS =====
      if (value === "status") {
        return interaction.reply({
          content: "📊 Seu status será atualizado após análise.",
          flags: 64
        });
      }
    }
  }

  // =========================
  // 📋 CADASTRO SIMPLES (SEM MODAL)
  // =========================
  if (interaction.isButton() && interaction.customId === "start_apply") {

    const embed = new EmbedBuilder()
      .setColor("#facc15")
      .setTitle("📨 NOVA APLICAÇÃO")
      .setDescription(
`Envio automático iniciado.

Seu pedido será analisado pela equipe.`
      );

    const canal = interaction.guild.channels.cache.get(ANALISE_CHANNEL);

    const msg = await canal.send({
      embeds: [embed],
      content: `👤 Novo candidato: <@${interaction.user.id}>`
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`approve_${interaction.user.id}`)
        .setLabel("Aprovar")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`reject_${interaction.user.id}`)
        .setLabel("Recusar")
        .setStyle(ButtonStyle.Danger)
    );

    await msg.edit({ components: [row] });

    // 📩 DM
    await interaction.user.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#22c55e")
          .setTitle("🏥 Hospital HP")
          .setDescription(
`Sua candidatura foi enviada!

🌐 ${DISCORD_LINK}`)
      ]
    }).catch(() => {});

    return interaction.reply({
      content: "📨 Pedido enviado!",
      flags: 64
    });
  }

  // =========================
  // ✅ APROVAR / ❌ RECUSAR
  // =========================
  if (interaction.isButton()) {

    const [action, userId] = interaction.customId.split("_");

    if (!userId) return;

    const member = await interaction.guild.members.fetch(userId);

    if (!interaction.member.roles.cache.has(LEADER_ROLE_ID)) {
      return interaction.reply({ content: "❌ Sem permissão", flags: 64 });
    }

    if (action === "reject") {

      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ef4444")
            .setTitle("❌ Reprovado")
            .setDescription(`Você não foi aprovado.\n\n🌐 ${DISCORD_LINK}`)
        ]
      }).catch(() => {});

      return interaction.reply({ content: "❌ Reprovado", flags: 64 });
    }

    if (action === "approve") {

      await member.roles.add([ROLE_MEDICO, ROLE_HP]).catch(() => {});

      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#22c55e")
            .setTitle("✅ Aprovado")
            .setDescription(`Bem-vindo ao Hospital!\n\n🌐 ${DISCORD_LINK}`)
        ]
      }).catch(() => {});

      return interaction.reply({ content: "✅ Aprovado", flags: 64 });
    }
  }
});

client.login(TOKEN);
