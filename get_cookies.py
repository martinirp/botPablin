import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv
import time

# Carregar variáveis do arquivo .env
load_dotenv()
email = os.getenv("EMAIL")
senha = os.getenv("SENHA")

# Verificar se as variáveis de ambiente foram carregadas corretamente
if not email or not senha:
    print("Erro: As variáveis de ambiente não foram carregadas corretamente.")
    exit(1)

# Configurações do ChromeDriver
options = Options()
# Remover a linha abaixo para rodar com a interface visível
# options.add_argument("--headless")  # Remova essa linha para deixar o navegador visível

options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

# Defina o caminho correto do seu chromedriver
service = Service('/usr/bin/chromedriver')  # Ajuste o caminho se necessário
driver = webdriver.Chrome(service=service, options=options)

try:
    # Acesse a página de login
    driver.get("https://accounts.google.com/signin")

    print("Aguarde, o navegador está aberto. Faça o login manualmente.")

    # Esperar um tempo para o login manual (dá tempo de você inserir o email e senha)
    time.sleep(60)  # Ajuste o tempo conforme necessário para você realizar o login

    # Capturar os cookies após o login
    cookies = driver.get_cookies()

    # Exibir os cookies para verificação
    print("Cookies capturados após o login:")
    for cookie in cookies:
        print(cookie)

    print("Login concluído com sucesso!")

except Exception as e:
    print(f"Erro: {e}")

finally:
    # Aguardar a interação manual antes de fechar o navegador
    input("Pressione Enter para fechar o navegador...")
    driver.quit()
