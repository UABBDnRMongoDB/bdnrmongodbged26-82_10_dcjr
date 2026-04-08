import json
from pymongo import MongoClient

################################## PARAMETRES DE CONNEXIÓ ###################################
mongoUser = '1745464'  # NIU
mongoPassword = 'd15882'  # passwordfitxer
BD_auth = 'BDNR_1745464'  # BDNR_NIU

# En execució remota
Host = 'mongoDB.uab.cat'  # localhost per connexions a la mateixa màquina
Port = 27017

###################################### CONNEXIÓ ##############################################


DSN = f"mongodb://{mongoUser}:{mongoPassword}@{Host}:{Port}/?authSource={BD_auth}"

conn = MongoClient(DSN)
bd = conn[BD_auth]

# Llista amb el nom de les teves 5 col·leccions
colecciones = ['usuaris', 'assignatures', 'videos', 'valoracions', 'visualitzacions']

for nom_col in colecciones:
    # 1. Comprova si existeix, l'esborra i la torna a crear (evita duplicats)
    if nom_col in bd.list_collection_names():
        coll = bd[nom_col]
        coll.drop()
    coll = bd.create_collection(nom_col)

    # 2. Llegeix el fitxer JSON i insereix les dades
    nombre_archivo = f"{nom_col}.json"

    try:
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            dades = json.load(f)
            if dades:
                coll.insert_many(dades)
                print(f"-> Col·lecció '{nom_col}' carregada amb èxit!")
    except FileNotFoundError:
        print(f"-> Error: No s'ha trobat el fitxer {nombre_archivo}")
