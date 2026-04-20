const { Client, GatewayIntentBits, Events } = require('discord.js');

// Criação do cliente do bot
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Evento quando o bot estiver pronto
client.once(Events.ClientReady, () => {
    console.log(`Bot ${client.user.tag} está online e pronto para ajudar!`);
});

// Comando para pedir informações sobre um funcionário
client.on(Events.MessageCreate, async (message) => {
    if (message.content.startsWith('!pedir_informacoes') && !message.author.bot) {
        await message.author.send("Por favor, forneça as informações do funcionário na forma de mensagens separadas.\n" +
            "Responda na seguinte ordem:\n" +
            "1. **Id**\n" +
            "2. **Nome**\n" +
            "3. **Unidade**\n" +
            "4. **Cargo**\n" +
            "5. **Responsável** (mencionar o responsável)");

        // Aguardando as respostas do usuário
        const filter = response => response.author.id === message.author.id;

        try {
            const id_msg = await message.author.dmChannel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
            const id_value = id_msg.first().content;

            const nome_msg = await message.author.dmChannel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
            const nome_value = nome_msg.first().content;

            const unidade_msg = await message.author.dmChannel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
            const unidade_value = unidade_msg.first().content;

            const cargo_msg = await message.author.dmChannel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
            const cargo_value = cargo_msg.first().content;

            const responsavel_msg = await message.author.dmChannel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
            const responsavel_value = responsavel_msg.first().content;

            // Mensagem final de confirmação
            await message.channel.send(`**Informações do Funcionário Registradas:**\n` +
                `Id: ${id_value}\n` +
                `Nome: ${nome_value}\n` +
                `Unidade: ${unidade_value}\n` +
                `Cargo: ${cargo_value}\n` +
                `Responsável: ${responsavel_value}`);

        } catch (err) {
            await message.channel.send("Ocorreu um erro ou o tempo esgotou. Certifique-se de responder a todas as perguntas.");
        }
    }
});

// Comando de ajuda
client.on(Events.MessageCreate, (message) => {
    if (message.content.startsWith('!ajuda
