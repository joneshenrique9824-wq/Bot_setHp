import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

/* =========================
   🔐 CONFIGURAÇÃO
========================= */
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const LEADER_ROLE_ID = process.env.LEADER_ROLE_ID;

const DISCORD_LINK = "https://discord.gg/SEULINK";

// 🎖️ CARGOS
const ROLE_PARAMEDICO_ID = "1477683902079303934";
const ROLE_MEMBRO_HP_ID = "1477683902079303932";

// 📌 CANAIS
const REQUEST_CHANNEL_ID = "1495178025602515177";
const APPROVAL_CHANNEL_ID = "1497304750214090846";

/* =========================
   🤖 CLIENT
========================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

/* =========================
   📌 COMANDOS
========================= */
const commands = [
  new SlashCommandBuilder()
    .setName("painelset")
    .setDescription("Abrir painel de recrutamento")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("limpar")
    .setDescription("Apagar mensagens do canal")
    .addIntegerOption(option =>
      option
        .setName("quantidade")
        .setDescription("Quantidade de mensagens (1-100)")
        .setRequired(true)
    )
    .toJSON()
];

/* =========================
   🚀 REGISTRO DE COMANDOS
========================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
  console.log(`🤖 Online como: ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Comandos registrados com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao registrar comandos:", err);
  }
});

/* =========================
   📌 INTERAÇÕES
========================= */
client.on("interactionCreate", async (interaction) => {

  /* ===== COMANDOS ===== */
  if (interaction.isChatInputCommand()) {

    /* ---- PAINEL ---- */
    if (interaction.commandName === "painelset") {

      const embed = new EmbedBuilder()
        .setColor("#22c55e")
        .setTitle("🏥 HOSPITAL BELLA")
        .setDescription(
`━━━━━━━━━━━━━━━━━━━
👨‍⚕️ SISTEMA DE RECRUTAMENTO

Clique no botão abaixo para iniciar seu cadastro.
━━━━━━━━━━━━━━━━━━━`
        )
        .setFooter({ text: "Hospital Bella - Sistema Automático" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("abrir_set")
          .setLabel("📋 Fazer Cadastro")
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    /* ---- LIMPAR ---- */
    if (interaction.commandName === "limpar") {

      const quantidade = interaction.options.getInteger("quantidade");

      if (!interaction.member.roles.cache.has(LEADER_ROLE_ID)) {
        return interaction.reply({
          content: "❌ Você não tem permissão para usar este comando.",
          flags: 64
        });
      }

      try {
        const deleted = await interaction.channel.bulkDelete(quantidade, true);

        return interaction.reply({
          content: `🧹 ${deleted.size} mensagens removidas com sucesso.`,
          flags: 64
        });
      } catch (err) {
        return interaction.reply({
          content: "❌ Erro ao limpar mensagens (mensagens antigas demais).",
          flags: 64
        });
      }
    }
  }

  /* ===== BOTÃO ABRIR FORM ===== */
  if (interaction.isButton() && interaction.customId === "abrir_set") {

    const modal = new ModalBuilder()
      .setCustomId("form_set")
      .setTitle("📋 Cadastro Hospital");

    const nome = new TextInputBuilder()
      .setCustomId("nome")
      .setLabel("Nome")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const id = new TextInputBuilder()
      .setCustomId("id")
      .setLabel("ID do servidor")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const exp = new TextInputBuilder()
      .setCustomId("exp")
      .setLabel("Experiência")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nome),
      new ActionRowBuilder().addComponents(id),
      new ActionRowBuilder().addComponents(exp)
    );

    return interaction.showModal(modal);
  }

  /* ===== ENVIO DO FORM ===== */
  if (interaction.isModalSubmit() && interaction.customId === "form_set") {

    const nome = interaction.fields.getTextInputValue("nome");
    const id = interaction.fields.getTextInputValue("id");
    const exp = interaction.fields.getTextInputValue("exp");

    const canal = interaction.guild.channels.cache.get(APPROVAL_CHANNEL_ID);

    if (!canal) {
      return interaction.reply({
        content: "❌ Canal de aprovação não encontrado.",
        flags: 64
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#facc15")
      .setTitle("📋 NOVO CADASTRO RECEBIDO")
      .addFields(
        { name: "👤 Nome", value: nome },
        { name: "🆔 ID", value: id },
        { name: "📚 Experiência", value: exp }
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprovar_${interaction.user.id}`)
        .setLabel("✅ Aprovar")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`recusar_${interaction.user.id}`)
        .setLabel("❌ Recusar")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({ embeds: [embed], components: [row] });

    try {
      await interaction.user.send(
`📨 Sua solicitação foi enviada com sucesso!

🌐 Entre no Discord:
${DISCORD_LINK}`
      );
    } catch {}

    return interaction.reply({
      content: "📨 Cadastro enviado! Verifique seu privado.",
      flags: 64
    });
  }

  /* ===== APROVAÇÃO / RECUSA ===== */
  if (interaction.isButton()) {

    const [acao, userId] = interaction.customId.split("_");

    if (!userId) return;

    let membro;
    try {
      membro = await interaction.guild.members.fetch(userId);
    } catch {
      return interaction.reply({
        content: "❌ Usuário não encontrado no servidor.",
        flags: 64
      });
    }

    if (acao === "recusar") {

      try {
        await membro.send(`❌ Sua candidatura foi recusada.\n🌐 ${DISCORD_LINK}`);
      } catch {}

      return interaction.reply({
        content: "❌ Cadastro recusado.",
        flags: 64
      });
    }

    if (acao === "aprovar") {

      try {
        await membro.roles.add([ROLE_PARAMEDICO_ID, ROLE_MEMBRO_HP_ID]);
      } catch {}

      try {
        await membro.send(`✅ Você foi aprovado!\n🌐 ${DISCORD_LINK}`);
      } catch {}

      return interaction.reply({
        content: "✅ Cadastro aprovado com sucesso!",
        flags: 64
      });
    }
  }
});

/* =========================
   🔑 LOGIN
========================= */
client.login(TOKEN);
