import psycopg2
import psycopg2.extras


DB_USER = "dualm"
DB_PASSWORD = "@p1_Du@l3!@"
DB_NAME = "dualm"


def conexao(ip_dominio):
    try:
        connection = psycopg2.connect(
            host= ip_dominio,
            user= DB_USER,
            password= DB_PASSWORD,
            dbname= DB_NAME,
            cursor_factory=psycopg2.extras.RealDictCursor  # cursor retorna dict
        )
        return {"success": True, "connection": connection}
    except psycopg2.Error as e:
        print(f"Erro na conexão com o banco '{ip_dominio}': {e}")
        return {"success": False, "message": f"Dominio '{ip_dominio}' não encontrado"}


if __name__ == "__main__":
    # Testando a conexão
    resultado = conexao("69.62.99.17")  # ou outro host se quiser trocar dinamicamente
    
    if resultado["success"]:
        conn = resultado["connection"]
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT NOW();")  # comando simples
                row = cur.fetchone()
                print("Conexão bem sucedida! Data/hora do servidor:", row)
        except Exception as e:
            print("Erro ao executar teste:", e)
        finally:
            conn.close()
    else:
        print("Falha:", resultado["message"])