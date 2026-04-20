import discord
from discord.ext import commands

# Criação do bot com intents apropriadas
intents = discord.Intents.default()
intents.messages = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Evento quando o bot estiver pronto
@bot.event
async def on_ready():
    print(f'Bot {bot.user.name} está online e pronto para ajudar!')

# Comando para pedir informações sobre um funcionário
@bot.command()
async def pedir_informacoes(ctx):
    await ctx.send("Por favor, forneça as informações do funcionário na forma de mensagens separadas.\n"
                   "Responda na seguinte ordem:\n"
                   "1. **Id**\n"
                   "2. **Nome**\n"
                   "3. **Unidade**\n"
                   "4. **Cargo**\n"
                   "5. **Responsável** (mencionar o responsável)")

    # Aguardando as respostas do usuário
    def check(m):
        return m.author == ctx.author and m.channel == ctx.channel

    try:
        # Coletando informações em cinco etapas
        id_msg = await bot.wait_for('message', check=check)
        id_value = id_msg.content

        nome_msg = await bot.wait_for('message', check=check)
        nome_value = nome_msg.content

        unidade_msg = await bot.wait_for('message', check=check)
        unidade_value = unidade_msg.content

        cargo_msg = await bot.wait_for('message', check=check)
        cargo_value = cargo_msg.content

        responsavel_msg = await bot.wait_for('message', check=check)
        responsavel_value = responsavel_msg.content

        # Mensagem final de confirmação
        await ctx.send(f"**Informações do Funcionário Registradas:**\n"
                       f"Id: {id_value}\n"
                       f"Nome: {nome_value}\n"
                       f"Unidade: {unidade_value}\n"
                       f"Cargo: {cargo_value}\n"
                       f"Responsável: {responsavel_value}")

    except Exception as e:
        await ctx.send("Ocorreu um erro. Certifique-se de responder todas as perguntas corretamente.")

# Comando de ajuda
@bot.command()
async def ajuda(ctx):
    help_message = (
        "Aqui estão os comandos disponíveis:\n"
        "`!pedir_informacoes`: Inicia o processo de coleta de informações sobre um funcionário.\n"
        "Responda na ordem: Id, Nome, Unidade, Cargo e Responsável.\n"
        "`!ajuda`: Mostra esta mensagem de ajuda."
    )
    await ctx.send(help_message)

# Inicie o bot com o token obtido da página do desenvolvedor do Discord
TOKEN = 'YOUR_BOT_TOKEN'  # Coloque seu token aqui
bot.run(TOKEN)
