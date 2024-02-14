
import requests, random
from faker import Faker
from app import app 
from model import db, Model, User, Color, PaintedModel

fake = Faker()

def create_models():
    models = []
    for _ in range(5):
        t = Model(
            name=fake.name(),
            filepath=fake.file_path(depth=1,category="3D Model", extension= ".gltf"),
            mesh=fake.text() 
        )
        models.append(t)

    return models  

def create_users():
    users = []
    for _ in range(5):
        t = User(
            username=fake.user_name(), 
            _password_hash='hashed_password',  
        )
        users.append(t)

    return users

def create_colors():
    colors = []
    for _ in range(50):
        t = Color(
            name=fake.color_name(),
            hexcode=fake.color(),
            material=fake.text() 
        )
        colors.append(t)

    return colors

def create_painted_models(models, colors, users):
    painted_models = []
    for _ in range(10):  
        print(models)
        model = random.choice(models)
        color = random.choice(colors)
        user = random.choice(users)

        pt = PaintedModel(
            model=model,
            color=color,
        )
        painted_models.append(pt)

    return painted_models

def seed_painted_models_data():
    models = Model.query.all()
    colors = Color.query.all()
    users = User.query.all()

    painted_models = create_painted_models(models, colors, users)
    for painted_model in painted_models:
        db.session.add(painted_model)
    db.session.commit()
    print('PaintedModels seeded successfully.')

def seed_users_data():
    users = create_users()
    for user in users:
        db.session.add(user)
    db.session.commit()
    print('Users seeded successfully.')


def seed_models_data():
    models = create_models()
    for model in models:
        db.session.add(model)
    db.session.commit()
    print('models seeded successfully.')

def seed_color_data():
    colors = create_colors()
    for color in colors:
        db.session.add(color)
    db.session.commit()
    print('Colors seeded successfully.')    


if __name__ == '__main__':
    with app.app_context():
        seed_color_data()
        seed_users_data()
        seed_models_data()
        seed_painted_models_data()



# import requests, random
# from faker import Faker
# from app import app 
# from model import db, Team, Trainer, Pokemon, PokeTeam

# fake = Faker()

# def create_teams():
#     teams = []
#     for _ in range(5):
#         t = Team(
#             name=fake.name(), 
#         )
#         teams.append(t)

#     return teams  

# def create_trainers():
#     trainers = []
#     for _ in range(5):
#         t = Trainer(
#             username=fake.user_name(), 
#             _password_hash='hashed_password',  
#         )
#         trainers.append(t)

#     return trainers

# def create_poke_teams(teams, pokemons, trainers):
#     poke_teams = []
#     for _ in range(10):  
#         print(teams)
#         team = random.choice(teams)
#         pokemon = random.choice(pokemons)
#         trainer = random.choice(trainers)

#         pt = PokeTeam(
#             team=team,
#             pokemon=pokemon,
#         )
#         poke_teams.append(pt)

#     return poke_teams

# def seed_poke_teams_data():
#     teams = Team.query.all()
#     pokemons = Pokemon.query.all()
#     trainers = Trainer.query.all()

#     poke_teams = create_poke_teams(teams, pokemons, trainers)
#     for poke_team in poke_teams:
#         db.session.add(poke_team)
#     db.session.commit()
#     print('PokeTeams seeded successfully.')

# def seed_trainers_data():
#     trainers = create_trainers()
#     for trainer in trainers:
#         db.session.add(trainer)
#     db.session.commit()
#     print('Trainers seeded successfully.')


# def seed_teams_data():
#     teams = create_teams()
#     for team in teams:
#         db.session.add(team)
#     db.session.commit()
#     print('Teams seeded successfully.')

# def seed_pokemon_data():
#     api_url = 'https://pokeapi.co/api/v2/pokemon/'
#     response = requests.get(api_url)

#     if response.status_code:
#         pokemon_data = response.json()
#         for pokemon in pokemon_data['results']:
#             name = pokemon['name']
#             new_pokemon = Pokemon(**Pokemon(name=name).to_dict())
#             db.session.add(new_pokemon)
#             db.session.commit()

#             print('Pokemon data seeded successfully.')
#     else:
#         print('Failed to fetch Pokemon data')

# if __name__ == '__main__':
#     with app.app_context():
#         seed_pokemon_data()
#         seed_trainers_data()
#         seed_teams_data()
#         seed_poke_teams_data()