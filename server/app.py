import logging
from flask import Flask, request, session, make_response, jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from flask_migrate import Migrate
from config import app, db, api
from model import db, User, Model, Color, PaintedModel
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG

@app.route('/')
def home():
    logging.debug('Accessed home route')
    return ''

@app.before_request
def route_filter():
    bypass_routes = ["signup", "login"]
    if request.endpoint not in bypass_routes and not session.get("user_id"):
        logging.debug(f'Unauthorized access to {request.endpoint}')
        return {"Error": "Unauthorized"}, 401

# SIGNUP - LOGIN - LOGOUT

@app.route('/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        try:
            data = request.get_json()
            logging.debug(f'Signup data: {data}')
            new_user = User(
                username=data["username"],
                _password_hash=data["password"]
            )
            new_user.password_hash = data['password']
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id
            logging.debug('User signed up successfully')
            return new_user.to_dict(rules=('-models', '-password_hash')), 201
        except IntegrityError as e:
            logging.error(f'Error during signup: {e}')
            return {"Error": "Username already exists"}, 422
        except KeyError as e:
            logging.error(f'Missing data during signup: {e}')
            return {"Error": "Missing required fields"}, 422

# @app.route('/checksession', methods=['GET'])
# def check_session():
#     if request.method == 'GET':
#         logging.debug(f'Check session: {session}')
#         user = User.query.filter(User.id == session['user_id']).first()
#         return user.to_dict(rules=('-models', '-password_hash')), 200

@app.route('/checksession', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.filter(User.id == user_id).first()
        if user:
            logging.debug(f'User {user.username} session found')
            return user.to_dict(rules=('-models', '-password_hash')), 200
    logging.debug('User session not found')
    return {"Error": "User session not found"}, 404


@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        user = User.query.filter(User.username == data["username"]).first()
        if user and user.authenticate(data['password']):
            session['user_id'] = user.id
            logging.debug(f'User {user.username} logged in')
            return user.to_dict(rules=('-models', '-password_hash')), 200
        else:
            logging.debug('Invalid username or password')
            return {"Error": "Invalid username or password"}, 401

@app.route('/logout', methods=['DELETE'])
def logout():
    if request.method == 'DELETE':
        session['user_id'] = None
        logging.debug('User logged out')
        return {}, 204

# MODEL WITH FULL CRUD

@app.route('/models', methods=['GET', 'POST'])
def model_route():
    if request.method == "GET":
        all_models = Model.query.all()
        dict_models = []
        for model in all_models:
            dict_models.append(model.to_dict())
        logging.debug('All models retrieved')
        return make_response(dict_models, 200)

    elif request.method == 'POST':
        try:
            data = request.get_json()
            new_model = Model(
                name=data['name'],
                filepath=data['filepath'],
                mesh=data['mesh'],
            )
            db.session.add(new_model)
            db.session.commit()
            logging.debug('New model added')
            return make_response(new_model.to_dict()), 201
        except KeyError as e:
            logging.error(f'Missing data during model creation: {e}')
            return {"Error": "Missing required fields"}, 400
        except Exception as e:
            logging.error(f'Error during model creation: {e}')
            return {"Error": "Failed to create model"}, 500

@app.route('/models/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def one_model_route(id):
    found_model = Model.query.filter(Model.id == id).first()
    if found_model:
        if request.method == 'GET':
            logging.debug(f'Model {id} retrieved')
            return make_response(found_model.to_dict(), 200)
        elif request.method == 'PATCH':
            try:
                data = request.get_json()
                for attr in data:
                    setattr(found_model, attr, data[attr])
                db.session.add(found_model)
                db.session.commit()
                logging.debug(f'Model {id} updated')
                return make_response(found_model.to_dict(), 202)
            except KeyError as e:
                logging.error(f'Missing data during model update: {e}')
                return {"Error": "Missing required fields"}, 400
            except Exception as e:
                logging.error(f'Error during model update: {e}')
                return {"Error": "Failed to update model"}, 500
        elif request.method == 'DELETE':
            db.session.delete(found_model)
            db.session.commit()
            logging.debug(f'Model {id} deleted')
            return {}, 204
    else:
        logging.debug(f'Model {id} not found')
        return {"Error": "Model not found"}, 404

# COLOR WITH FULL CRUD

@app.route('/colors', methods=['GET', 'POST'])
def color_route():
    if request.method == 'GET':
        all_colors = Color.query.all()
        dict_colors = []
        for color in all_colors:
            dict_colors.append(color.to_dict())
        logging.debug('All colors retrieved')
        return make_response(dict_colors, 200)

    elif request.method == 'POST':
        try:
            data = request.get_json()
            new_color = Color(
                name=data['name'],
                hexcode=data['hexcode'],
                material=data['material'],
            )
            db.session.add(new_color)
            db.session.commit()
            logging.debug('New color added')
            return make_response(new_color.to_dict()), 201
        except KeyError as e:
            logging.error(f'Missing data during color creation: {e}')
            return {"Error": "Missing required fields"}, 400
        except Exception as e:
            logging.error(f'Error during color creation: {e}')
            return {"Error": "Failed to create color"}, 500

@app.route('/colors/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def one_color_route(id):
    found_color = Color.query.filter(Color.id == id).first()
    if found_color:
        if request.method == 'GET':
            logging.debug(f'Color {id} retrieved')
            return make_response(found_color.to_dict(), 200)
        elif request.method == 'PATCH':
            try:
                data = request.get_json()
                for attr in data:
                    setattr(found_color, attr, data[attr])
                db.session.add(found_color)
                db.session.commit()
                logging.debug(f'Color {id} updated')
                return make_response(found_color.to_dict(), 202)
            except KeyError as e:
                logging.error(f'Missing data during color update: {e}')
                return {"Error": "Missing required fields"}, 400
            except Exception as e:
                logging.error(f'Error during color update: {e}')
                return {"Error": "Failed to update color"}, 500
        elif request.method == 'DELETE':
            db.session.delete(found_color)
            db.session.commit()
            logging.debug(f'Color {id} deleted')
            return {}, 204
    else:
        logging.debug(f'Color {id} not found')
        return {"Error": "Color not found"}, 404
    
# PAINTEDMODEL WITH FULL CRUD    

@app.route('/painted_models', methods=['GET', 'POST'])
def painted_model_route():
    if request.method == 'GET':
        all_painted_models = PaintedModel.query.all()
        dict_painted_models = []
        for painted_model in all_painted_models:
            dict_painted_models.append(painted_model.to_dict())
        logging.debug('All painted models retrieved')
        return make_response(dict_painted_models, 200)

    elif request.method == 'POST':
        try:
            data = request.get_json()
            new_painted_model = PaintedModel(
                model_id=data['model_id'],
                color_id=data['color_id'],
            )
            db.session.add(new_painted_model)
            db.session.commit()
            logging.debug('New painted model added')
            return {}, 204
        except KeyError as e:
            logging.error(f'Missing data during painted model creation: {e}')
            return {"Error": "Missing required fields"}, 400
        except Exception as e:
            logging.error(f'Error during painted model creation: {e}')
            return {"Error": "Failed to create painted model"}, 500

@app.route('/painted_models/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def one_painted_model_route(id):
    found_painted_model = PaintedModel.query.filter(PaintedModel.id == id).first()
    if found_painted_model:
        if request.method == 'GET':
            logging.debug(f'Painted model {id} retrieved')
            return make_response(found_painted_model.to_dict(), 200)
        elif request.method == 'PATCH':
            try:
                data = request.get_json()
                for attr in data:
                    setattr(found_painted_model, attr, data[attr])
                db.session.add(found_painted_model)
                db.session.commit()
                logging.debug(f'Painted model {id} updated')
                return make_response(found_painted_model.to_dict(), 202)
            except KeyError as e:
                logging.error(f'Missing data during painted model update: {e}')
                return {"Error": "Missing required fields"}, 400
            except Exception as e:
                logging.error(f'Error during painted model update: {e}')
                return {"Error": "Failed to update painted model"}, 500
        elif request.method == 'DELETE':
            db.session.delete(found_painted_model)
            db.session.commit()
            logging.debug(f'Painted model {id} deleted')
            return {}, 204
    else:
        logging.debug(f'Painted model {id} not found')
        return {"Error": "Painted Model not found"}, 404

# SAVE-MODEL

@app.route('/save-model', methods=['POST', 'PATCH'])
@app.route('/save-model/<int:id>', methods=['PATCH'])
def save_model(id=None):
    if request.method == 'POST':
        data = request.get_json()
        user_id = session.get('user_id')

        if user_id:
            model_name = data.get('model_name')
            model_filepath = data.get('model_filepath')
            model_meshes = data.get('model_meshes', [])
            colors = data.get('colors', [])

            new_model = Model(name=model_name, filepath=model_filepath, mesh=",".join(model_meshes), user_id=user_id)
            db.session.add(new_model)
            db.session.commit()

            model_id = new_model.id

            for color_data in colors:
                color_hexcode = color_data['color_hexcode']
                color_material = color_data['color_material']

                existing_color = Color.query.filter_by(hexcode=color_hexcode, material=color_material).first()
                if not existing_color:
                    new_color = Color(hexcode=color_hexcode, material=color_material)
                    db.session.add(new_color)
                    db.session.commit()
                else:
                    new_color = existing_color

                new_painted_model = PaintedModel(model_id=new_model.id, color_id=new_color.id)
                db.session.add(new_painted_model)

            db.session.commit()

            logging.debug('Model and Colors saved successfully')
            return jsonify(message='Model and Colors saved successfully'), 201
        else:
            logging.error('User not authenticated')
            return {"Error": "User not authenticated"}, 401

    elif request.method == 'PATCH':
        try:
            data = request.get_json()
            user_id = session.get('user_id')

            existing_model = Model.query.get(id)

            if not existing_model:
                return jsonify(error='Model not found'), 404

            # Process PATCH request and update the model
            # Add more detailed logging here
            logging.debug(f'PATCH request data: {data}')
            logging.debug(f'User ID: {user_id}')
            logging.debug(f'Existing model: {existing_model}')

            # Get the existing painted models for the given model ID
            existing_painted_models = PaintedModel.query.filter_by(model_id=id).all()

            # Update the colors for each painted model based on the received data
            for painted_model_data in data.get('painted_models', []):
                material_name = painted_model_data['model']['name']
                hexcode = painted_model_data['color']['hexcode']

                # Find the corresponding painted model in the existing painted models
                existing_painted_model = next((p for p in existing_painted_models if p.color.material == material_name), None)
                if existing_painted_model:
                    # Get the color associated with the painted model
                    existing_color = Color.query.get(existing_painted_model.color_id)
                    if existing_color:
                        # Check if the hexcode is different from the received data
                        if existing_color.hexcode != hexcode:
                            # Update the hexcode
                            existing_color.hexcode = hexcode
                    else:
                        # Create a new color entry if it doesn't exist
                        new_color = Color(hexcode=hexcode, material=material_name)
                        db.session.add(new_color)
                        existing_painted_model.color_id = new_color.id
                else:
                    # Create a new painted model entry if it doesn't exist
                    existing_color = Color.query.filter_by(material=material_name, hexcode=hexcode).first()
                    if not existing_color:
                        new_color = Color(hexcode=hexcode, material=material_name)
                        db.session.add(new_color)
                        db.session.commit()  # Commit to generate color ID
                    else:
                        new_color = existing_color

                    new_painted_model = PaintedModel(model_id=id, color_id=new_color.id)
                    db.session.add(new_painted_model)

            db.session.commit()
            logging.debug('Model updated successfully')
            return jsonify(message='Model updated successfully'), 200

        except SQLAlchemyError as e:
            # Handle database errors
            db.session.rollback()
            logging.error(f'Database error: {e}')
            return jsonify(error=str(e), message='Database error occurred while updating the model'), 500

        except Exception as e:
            # Handle other unexpected errors
            logging.error(f'Unexpected error: {e}')
            return jsonify(error=str(e), message='An unexpected error occurred while updating the model'), 500
if __name__ == '__main__':
    app.run(port=5555, debug=True)


# # ________________________________________________________________________________________________________________________________________________________________________________________________________
# These are the routes without debugging added

# from flask import request, session
# from sqlalchemy.exc import IntegrityError, SQLAlchemyError
# from flask import Flask, make_response, jsonify, request
# from flask_migrate import Migrate
# from config import app, db, api
# from model import db, Model, Color , PaintedModel, User
# import os

# BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# DATABASE = os.environ.get(
#     "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")


# @app.route('/')
# def home():
#     return ''


# @app.before_request
# def route_filter():
#     bypass_routes = ["signup","login"]
#     if request.endpoint not in bypass_routes and not session.get("user_id"):
#         return {"Error": "Unauthorized"},401

# # ________________________________________________________________________________________________________________________________________________________________________________________________________
# # SIGNUP - LOGIN - LOGOUT


# # POST SIGNUP
    
# @app.route('/signup',methods=['POST'])
# def signup():
#     if request.method == 'POST':
#         try:
#             data = request.get_json()
#             print(data)
#             new_user = User(
#                 username = data["username"],
#                 _password_hash = data["password"]
#             )
#             new_user.password_hash = data['password']
#             db.session.add(new_user)
#             db.session.commit()
#             session['user_id'] = new_user.id
#             return new_user.to_dict(rules = ('-models', '-password_hash')),201
#         except Exception as e:
#             print(e)
#             return {"Error": "Could not make user"}, 422
        
# # GET CHECKSESSION

# @app.route('/checksession', methods=['GET'])
# def check_session():
#     if request.method == 'GET':
#         print(session)
#         user = User.query.filter(User.id == session['user_id']).first()
#         return user.to_dict(rules = ('-models', '-password_hash')),200
    
# # POST LOGIN
    
# @app.route('/login', methods=['POST'])
# def login():
#     if request.method == 'POST':
#         data = request.get_json()
#         user = User.query.filter(User.username == data["username"]).first()
#         if user and user.authenticate(data['password']):
#             session['user_id'] = user.id
#             print(session)
#             return user.to_dict(rules = ('-models','-password_hash')),200
#         else:
#             return {"Error": "Not valid username or password"}, 401

# # DELETE LOGOUT

# @app.route('/logout', methods=['DELETE'])
# def logout():
#     if request.method == 'DELETE':
#         session['user_id'] = None
#         return {}, 204

# # ________________________________________________________________________________________________________________________________________________________________________________________________________
# # MODEL WITH FULL CRUD


# # GET

# @app.route('/models', methods = ['GET', 'POST'])
# def model_route():
#     if request.method == "GET":
#         all_models = Model.query.all()
#         dict_models = []
#         for model in all_models:
#             dict_models.append(model.to_dict())
#         return make_response(dict_models,200)

# # POST

#     elif request.method == 'POST':
#         try:
#             data = request.get_json()
#             new_model = Model(
#                 name = data['name'],
#                 filepath = data['filepath'],
#                 mesh = data['mesh'],
#             )
#             db.session.add(new_model)
#             db.session.commit()
#             return make_response(new_model.to_dict())
#         except:
#             return make_response({"Errors": ["Validation errors"]},400)

# @app.route('/models/<int:id>', methods = ['GET', 'PATCH', 'DELETE'])
# def one_model_route(id):
#     found_model = Model.query.filter(Model.id==id).first()
#     if found_model:

# # GET ID

#         if request.method == 'GET':
#             return make_response(found_model.to_dict(),200)
        
# # PATCH ID
        
#         elif request.method == 'PATCH':
#             try:
#                 data = request.get_json()
#                 for attr in data:
#                     setattr(found_model,attr,data[attr])
#                 db.session.add(found_model)
#                 db.session.commit()
#                 return make_response(found_model.to_dict(),202)
#             except:
#                 return make_response({'Errors': ['Validation errors']},400)

# # DELETE ID

#         elif request.method == 'DELETE':
#             db.session.delete(found_model)
#             db.session.commit()
#             return make_response({},204)
#     else:
#         return make_response({'Error':'Model not found'},404)

# # ________________________________________________________________________________________________________________________________________________________________________________________________________
# # COLOR WITH FULL CRUD


# # GET

# @app.route('/color', methods = ['GET', 'POST'])
# def color_route():
#     if request.method == 'GET':
#         all_colors = Color.query.all()
#         dict_colors = []
#         for color in all_colors:
#             dict_colors.append(color.to_dict())
#         return make_response(dict_colors,200)

# # POST

#     elif request.method == 'POST':
#         try:
#             data = request.get_json()
#             new_color = Color(
#                 name = data['name'],
#                 hexcode = data['hexcode'],
#                 material = data['material'],
#             )
#             db.session.add(new_color)
#             db.session.commit()
#             return make_response(new_color.to_dict())
#         except:
#             return make_response({"Errors": ['Validation errors']},400)

# @app.route('/colors/<int:id>', methods = ['GET', 'PATCH', 'DELETE'])
# def one_color_route(id):
#     found_color = Color.query.filter(Color.id==id).first()
#     if found_color:

# # GET ID

#         if request.method == 'GET':
#             return make_response(found_color.to_dict(),200)

# # PATCH ID

#         elif request.method == 'PATCH':
#             try:
#                 data = request.get_json()
#                 for attr in data:
#                     setattr(found_color,attr,data[attr])
#                 db.session.add(found_color)
#                 db.session.commit()
#                 return make_response(found_color.to_dict(),202)
#             except:
#                 return make_response({'Errors': ['Validation errors']},400)
            
# # DELETE ID

#         elif request.method == 'DELETE':
#             db.session.delete(found_color)
#             db.session.commit()
#             return make_response({},204)
#     else:
#         return make_response({'Error': "Color not found"},404)

# # ________________________________________________________________________________________________________________________________________________________________________________________________________
# # PAINTEDMODEL WITH FULL CRUD


# # GET

# @app.route('/painted_model', methods=['GET','POST','PATCH','DELETE'])
# def painted_model_route():
#     if request.method == 'GET':
#         all_painted_models = PaintedModel.query.all()
#         dict_painted_models = []
#         for painted_model in all_painted_models:
#             dict_painted_models.append(painted_model.to_dict())
#         return make_response(dict_painted_models,200)
    
# # POST

#     elif request.method == 'POST':
#         try:
#             data = request.get_json()
#             new_painted_model = PaintedModel(
#                 model_id = data['model_id'],
#                 color_id = data['color_id'],
#             )
#             db.session.add(new_painted_model)
#             db.session.commit()
#             return make_response({},204)
#         except:
#             return make_response(new_painted_model.to_dict(),201)
        
# # PATCH

#     elif request.method == 'PATCH':
#         try:
#             data = request.get_json()
#             for attr in data:
#                 setattr(painted_model,attr,data[attr])
#             db.session.add(painted_model)
#             db.session.commit()
#             return make_response(painted_model.to_dict(),202)
#         except:
#             return make_response({"Errors": ["Validation errors"]},400)
        
# # DELETE

#     elif request.method == 'DELETE':
#         db.session.delete(new_painted_model)
#         db.session.commit()
#         return make_response({},204)

# @app.route('/painted_models/<int:id>', methods = ['GET', 'PATCH', 'DELETE'])
# def one_painted_model_route(id):
#     found_painted_model = PaintedModel.query.filter(PaintedModel.id==id).first()
#     if found_painted_model:

# # GET ID

#         if request.method == 'GET':
#             return make_response(found_painted_model.to_dict(),200)
        
# # PATCH ID

#         elif request.method == 'PATCH':
#             try:
#                 data = request.get_json()
#                 for attr in data:
#                     setattr(found_painted_model,attr,data[attr])
#                 db.session.add(found_painted_model)
#                 db.session.commit()
#                 return make_response(found_painted_model.to_dict(),202)
#             except:
#                 return make_response({'Errors': ["Validation errors"]},400)
            
# # DELETE

#         elif request.method == 'DELETE':
#             db.session.delete(found_painted_model)
#             db.session.commit()
#             return make_response({},204)
#         else:
#             return make_response({'Error': 'Painted Model not found'},404)

# # ________________________________________________________________________________________________________________________________________________________________________________________________________
# # SAVE-MODEL


# # POST

# @app.route('/save-model', methods=['POST', 'PATCH'])
# @app.route('/save-model/<int:id>', methods=['PATCH'])
# def save_model(id=None):

#     if request.method == 'POST':
#         data = request.get_json()
#         user_id = session.get('user_id')

#         if user_id:
#             # new_model = Model(name=data['model_name'], user_id=user_id)
#             # db.session.add(new_model)
#             # db.session.commit()

#         # Extract data from the request
#             model_name = data.get('model_name')
#             model_filepath = data.get('model_filepath')
#             model_meshes = data.get('model_meshes', [])
#             colors = data.get('colors', [])

#             # Create the model entry in the database
#             new_model = Model(name=model_name, filepath=model_filepath, mesh=",".join(model_meshes), user_id=user_id)
#             db.session.add(new_model)
#             db.session.commit()

#             # Obtain the ID of the newly created model
#             model_id = new_model.id

#             # Add colors and their mappings to the model
#             for color_data in colors:
#                 color_hexcode = color_data['color_hexcode']
#                 color_material = color_data['color_material']

#                 # Check if the color already exists in the database
#                 existing_color = Color.query.filter_by(hexcode=color_hexcode, material=color_material).first()
#                 if not existing_color:
#                     # Create a new color entry if it doesn't exist
#                     new_color = Color(hexcode=color_hexcode, material=color_material)
#                     db.session.add(new_color)
#                     db.session.commit()
#                 else:
#                     new_color = existing_color

#                 # Create the painted model entry
#                 new_painted_model = PaintedModel(model_id=new_model.id, color_id=new_color.id)
#                 db.session.add(new_painted_model)

#             # Commit changes to the database
#             db.session.commit()

#             return jsonify(message='Model and Colors saved successfully'), 201


# # @app.route('/save-model', methods=['POST', 'PATCH'])
# # def save_model():
# #     if request.method == 'POST':
# #         data = request.get_json()
# #         user_id = session.get('user_id')

#         # if user_id:
#         #     new_model = Model(name=data['model_name'], user_id=user_id)
#         #     db.session.add(new_model)
#         #     db.session.commit()

# #             for color_data in data['colors']:
# #                 color_hexcode = color_data['color_hexcode']
# #                 color_name = color_data.get('color_name')  # Accepts NULL
# #                 color_material = color_data.get('color_material')

# #                 # Check if material is provided
# #                 if color_material is None:
# #                     return jsonify(error='Material not provided for color: {}'.format(color_hexcode)), 400

# #                 new_color = Color(hexcode=color_hexcode, name=color_name, material=color_material)
# #                 db.session.add(new_color)

# #                 new_painted_model = PaintedModel(model_id=new_model.id, color_id=new_color.id)
# #                 db.session.add(new_painted_model)

# #             try:
# #                 db.session.commit()
# #                 return jsonify(message='Model and Color Palette Created'), 201
# #             except Exception as e:
# #                 db.session.rollback()
# #                 return jsonify(error=str(e), message= 'An error occurred, please try again'), 500

# # PATCH

#     if request.method == 'PATCH':
#         try:
#             data = request.get_json()
#             user_id = session.get('user_id')

#             # Retrieve existing model by id
#             existing_model = Model.query.get(id)

#             if not existing_model:
#                 return jsonify(error='Model not found'), 404
            
#             if 'model_name' in data:
#                 existing_model.name = data['model_name']

#             if 'color_hexcodes' in data:
#                 for color_data in data['color_hexcodes']:
#                     hexcode = color_data.get('hexcode')
#                     material = color_data.get('material')

#                     existing_color = Color.query.filter_by(material=material).first()

#                     if existing_color:
#                         existing_color.hexcode = hexcode
#                     else:
#                         new_color = Color(hexcode=hexcode, material=material)
#                         db.session.add(new_color)

#                     # Create or update the PaintedModel entry
#                     painted_model = PaintedModel.query.filter_by(model_id=id, color_id=existing_color.id).first()
#                     if painted_model:
#                         painted_model.color_id = existing_color.id
#                     else:
#                         new_painted_model = PaintedModel(model_id=id, color_id=existing_color.id)
#                         db.session.add(new_painted_model)

#             db.session.commit()
#             return jsonify(message='Model updated successfully'), 200
        
#         except SQLAlchemyError as e:
#             db.session.rollback()
#             return jsonify(error=str(e), message='Database error occurred while updating the model'), 500

#         except Exception as e:
#             return jsonify(error=str(e), message='An unexpected error occurred while updating the model'), 500


# if __name__=='__main__':
#     app.run(port=5555,debug=True)     

#_______________________________________________________________________________________________________________________________________________________________________________________________________________
# This is the original code for pokedeck

#  from flask import request, session
# from sqlalchemy.exc import IntegrityError
# from flask import Flask, make_response, jsonify, request
# from flask_migrate import Migrate
# from config import app, db, api
# from model import db, Team, Pokemon , PokeTeam, Trainer
# import os

# BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# DATABASE = os.environ.get(
#     "DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")


# @app.route('/')
# def home():
#     return ''


# @app.before_request
# def route_filter():
#     bypass_routes = ["signup","login"]
#     if request.endpoint not in bypass_routes and not session.get("user_id"):
#         return {"Error": "Unauthorized"},401
    
# @app.route('/signup',methods=['POST'])
# def signup():
#     if request.method == 'POST':
#         try:
#             data = request.get_json()
#             print(data)
#             new_trainer = Trainer(
#                 username = data["username"],
#                  _password_hash = data["password"]
                
#             )
#             new_trainer.password_hash = data["password"]
#             db.session.add(new_trainer)
#             db.session.commit()
#             session['trainer_id'] = new_trainer.id
#             return new_trainer.to_dict(rules = ('-teams','-password_hash')),201
#         except Exception as e:
#             print(e)
#             return {"Error": "Could not make trainer"},422
        
# @app.route('/checksession',methods=['GET'])
# def check_session():
#     if request.method == 'GET':
#         print(session)
#         user = Trainer.query.filter(Trainer.id == session["trainer_id"]).first()
#         return user.to_dict(rules = ('-teams','-password_hash')),200
    
# @app.route('/login', methods=['POST'])
# def login():
#     if request.method == 'POST':
#         data = request.get_json()
#         trainer = Trainer.query.filter(Trainer.username == data["username"]).first()
#         if trainer and trainer.authenticate(data['password']):
#             session['trainer_id'] = trainer.id
#             print(session)
#             return trainer.to_dict(rules = ('-teams','-password_hash')),200
#         else:
#             return {"Error": "Not valid trainer name or password"}, 401
        

# @app.route('/logout', methods=['DELETE'])
# def logout():
#     if request.method == 'DELETE':
#         session['trainer_id'] = None
#         return {},204
    
# @app.route('/teams', methods = ['GET','POST'])
# def team_route():
#     if request.method == "GET":
#         all_teams = Team.query.all()
#         dict_teams = []
#         for team in all_teams:
#             dict_teams.append(team.to_dict())
#         return make_response(dict_teams,200)
#     elif request.method == "POST":
#         try:
#             data = request.get.json()
#             new_team = Team(
#                 name = data['name'])
#             db.session.add(new_team)
#             db.session.commit()
#             return make_response(new_team.to_dict())
#         except:
#             return make_response({"errors": ["validation errors"]},400)
        
# @app.route('/teams/<int:id>', methods = ['GET', 'PATCH','DELETE'])
# def one_team_route(id):
#     found_team = Team.query.filter(Team.id==id).first()
#     if found_team:
#         if request.method == "GET":
#             return make_response(found_team.to_dict(),200)
#         elif request.method == "PATCH":
#             try:
#                 data = request.get_json()
#                 for attr in data:
#                     setattr(found_team,attr,data[attr])
#                 db.session.add(found_team)
#                 db.session.commit()
#                 return make_response(found_team.to_dict(),202)
#             except:
#                 return make_response({"errors": ["validation errors"]},400)
#         elif request.method == "DELETE":
#             db.session.delete(found_team)
#             db.session.commit()
#             return make_response({},204)
#     else:
#         return make_response({"error": "Team not found"},404)
        
# @app.route('/pokemon')
# def pokemon_route():
#     all_pokemons = Pokemon.query.all()
#     dict_pokemons = []
#     for i, pokemon in enumerate(all_pokemons):
#         if i < 12:
#             dict_pokemons.append(pokemon.to_dict())
#     return make_response(dict_pokemons,200)

# @app.route('/poketeam', methods=['POST','DELETE'])
# def poketeam_route():
#     if request.method == "POST":
#         try:
#             data = request.get_json()
#             new_poketeam = PokeTeam(
#                 team_id = data['team_id'],
#                 pokemon_id = data['pokemon_id'],
#             )
#             db.session.add(new_poketeam)
#             db.session.commit()
#             return make_response({},204)
#         except:
#             return make_response(new_poketeam.to_dict(),201)
#     elif request.method == "DELETE":
#         db.session.delete(new_poketeam)
#         db.session.commit()
#         return make_response({},204)
    
# @app.route('/save-team', methods=['POST', 'PATCH'])
# def save_team():
#     if request.method == "POST":
#         data = request.get_json()

#         # Retrieve the trainer ID from the session
#         trainer_id = session.get("trainer_id")

#         if trainer_id:
#             new_team = Team(name=data['team_name'], trainer_id=trainer_id)
#             db.session.add(new_team)
#             db.session.commit()

#             for pokemon_name in data['pokemon_names']:
#                 new_pokemon = Pokemon(name=pokemon_name)
#                 db.session.add(new_pokemon)
#                 db.session.commit()

#                 new_poketeam = PokeTeam(team_id=new_team.id, pokemon_id=new_pokemon.id)
#                 db.session.add(new_poketeam)

#             try:
#                 db.session.commit()
#                 return jsonify(message='Team and Pokemon Created'), 201
#             except Exception as e:
#                 db.session.rollback()
#                 return jsonify(error=str(e), message='An error occurred, please try again'), 500

#     elif request.method == "PATCH":
#         data = request.get_json()

#         team_id = data.get('team_id')
#         existing_team = Team.query.get(team_id)

#         if not existing_team:
#             return jsonify(error='Team not found'), 404

#         if 'team_name' in data:
#             existing_team.name = data['team_name']
            
#         if 'pokemon_names' in data:
#             existing_team.poke_teams = []

#             for pokemon_name in data['pokemon_names']:
#                 existing_pokemon = Pokemon.query.filter_by(name=pokemon_name).first()

#                 if not existing_pokemon:
#                     existing_pokemon = Pokemon(name=pokemon_name)
#                     db.session.add(existing_pokemon)
#                     db.session.flush()

#                 new_poketeam = PokeTeam(team_id=existing_team.id, pokemon_id=existing_pokemon.id)
#                 db.session.add(new_poketeam)

#         try:
#             db.session.commit()
#             return jsonify(message='Team updated successfully'), 200
#         except Exception as e:
#             db.session.rollback()
#             return jsonify(error=str(e), message='An error occurred while updating the team'), 500


# """
# api.add_resource(Logout, '/logout', endpoint='logout')
# api.add_resource(Signup, '/signup', endpoint='signup')
# api.add_resource(CheckSession, '/check_session', endpoint='check_session')
# api.add_resource(Login, '/login', endpoint='login')
# """

# if __name__ == '__main__':
#     app.run(port=5555, debug=True)
        


# # team- full CRUD
# # pokemon- get
# # poketeam- post delete
# # 