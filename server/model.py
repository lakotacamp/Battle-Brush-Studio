from sqlalchemy import ForeignKey, Column, Integer, String, create_engine, MetaData
from sqlalchemy.orm import Session, declarative_base, relationship, validates
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from flask_sqlalchemy import SQLAlchemy

from config import db, bcrypt

# ________________________________________________________________________________________________________________________________________________________________________________________________________
# USER TABLE

class User(db.Model,SerializerMixin):
    __tablename__='users'
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String, unique = True, nullable = False)
    _password_hash = db.Column(db.String)
    model = db.relationship('Model', back_populates = "user")
    serialize_rules = ('-painted_models.user',)

    @hybrid_property
    def password_hash(self):
        raise AttributeError("Can't access this")
    
    @password_hash.setter
    def password_hash(self, password):
        hashed_password = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = hashed_password.decode('utf-8')

    def authenticate(self,password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
    
    @validates('user')
    def validate_user(self,value):
        if value:
            return value
        else:
            raise ValueError("Not valid user")

# ________________________________________________________________________________________________________________________________________________________________________________________________________
# MODEL TABLE

class Model(db.Model, SerializerMixin):
    __tablename__="models"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String)
    filepath = db.Column(db.String)
    mesh = db.Column(db.String)
    painted_models = db.relationship("PaintedModel", back_populates="model")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", back_populates="model")
    serialize_rules=('-painted_models.model', '-user.model')

    def __repr__(self):
        return repr(f"{self.name}, {self.user}")

# ________________________________________________________________________________________________________________________________________________________________________________________________________
# COLOR TABLE

class Color(db.Model,SerializerMixin):
    __tablename__="colors"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, nullable=True)
    hexcode = db.Column(db.String)
    material = db.Column(db.String, unique=True)
    painted_models = db.relationship("PaintedModel", back_populates="color")
    serialize_rules=("-painted_models.color",)

    def __repr__(self):
        return repr(f"{self.name}")

# ________________________________________________________________________________________________________________________________________________________________________________________________________
# PAINTEDMODEL TABLE

class PaintedModel(db.Model, SerializerMixin):
    __tablename__="painted_models"
    id = db.Column(db.Integer, primary_key = True)
    model_id = db.Column(db.Integer, ForeignKey('models.id'))
    model = db.relationship("Model", back_populates='painted_models')
    color_id = db.Column(db.Integer, ForeignKey('colors.id'))
    color = db.relationship('Color', back_populates='painted_models')
    serialize_rules = ('-model.painted_models', '-color.painted_models')

    def __repr__(self):
        return repr(f"{self.model}, {self.color}")


# from sqlalchemy import ForeignKey, Column, Integer, String, create_engine, MetaData
# from sqlalchemy.orm import Session, declarative_base, relationship, validates
# from sqlalchemy.ext.hybrid import hybrid_property
# from sqlalchemy_serializer import SerializerMixin
# from flask_sqlalchemy import SQLAlchemy

# from config import db, bcrypt

# #Base = declarative_base()

# # convention = {
# #     "ix": "ix_%(column_0_label)s",
# #     "uq": "uq_%(table_name)s_%(column_0_name)s",
# #     "ck": "ck_%(table_name)s_%(constraint_name)s",
# #     "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
# #     "pk": "pk_%(table_name)s"
# # }

# # metadata = MetaData(naming_convention=convention)

# # db = SQLAlchemy(metadata=metadata)

# class Trainer(db.Model, SerializerMixin):
#     __tablename__ = 'trainers'
#     id = db.Column(db.Integer, primary_key = True)
#     username = db.Column(db.String, unique = True, nullable = False)
#     _password_hash = db.Column(db.String)
#     #relationship column:
#     #poke_teams = db.relationship('PokeTeam', back_populates = "trainer")
#     team = db.relationship('Team', back_populates = "trainer")
#     #serialzier:
#     serialize_rules = ('-poke_teams.trainer',)

#     @hybrid_property
#     def password_hash(self):
#         raise AttributeError("Can't access this")
#         # return self._password_hash
    
#     #This is boiler plate code:
#     @password_hash.setter
#     def password_hash(self, password):
#         hashed_password = bcrypt.generate_password_hash(password.encode('utf-8'))
#         self._password_hash = hashed_password.decode('utf-8')

#     def authenticate(self,password):
#         return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
    
#     #Validation: Must have Trainer
#     @validates('trainer')
#     def validate_trainer(self,key,value):
#         if value:
#             return value
#         else:
#             raise ValueError("Not valid trainer")

# #This is the table that has full crud.
# class Team(db.Model,SerializerMixin):
#     __tablename__= "teams"
#     id = db.Column(db.Integer, primary_key = True)
#     name = db.Column(db.String)
#     #relationship columns:
#     poke_teams = db.relationship("PokeTeam", back_populates="team")
#     trainer_id = db.Column(db.Integer, db.ForeignKey("trainers.id"))
#     trainer = db.relationship("Trainer", back_populates="team")
#     #serializer:
#     serialize_rules=('-poke_teams.team','-trainer.team')

#     def __repr__(self):
#         return repr(f"{self.name}, {self.trainer}")

# class Pokemon(db.Model, SerializerMixin):
#     __tablename__= "pokemons"
#     id = db.Column(db.Integer, primary_key = True)
#     name = db.Column(db.String)
#     #relationship column:
#     poke_teams = db.relationship("PokeTeam", back_populates="pokemon")
#     #serializer:
#     serialize_rules=('-poke_teams.pokemon',)

#     def __repr__(self):
#         return repr(f"{self.name}")

# #PokeTeam is not your actual team. Poketeam is a locker for keeping your teams in. Teams is the most important table.
# class PokeTeam(db.Model, SerializerMixin):
#     __tablename__ = "poke_teams"
#     id = db.Column(db.Integer, primary_key = True)
#     #Relationship columns:
#     team_id = db.Column(db.Integer, ForeignKey("teams.id"))
#     team = db.relationship("Team", back_populates="poke_teams")
#     pokemon_id = db.Column(db.Integer, ForeignKey("pokemons.id"))
#     pokemon = db.relationship("Pokemon", back_populates="poke_teams")
#     #Serializer:
#     serialize_rules = ('-team.poke_teams','-pokemon.poke_teams')

#     def __repr__(self):
#         return repr(f"{self.team}, {self.pokemon}")


# #engine = create_engine("sqlite:///pokedex.db")