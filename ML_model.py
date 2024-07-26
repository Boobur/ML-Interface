import eel
from tkinter import filedialog
from tkinter import *
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

eel.init('web')



@eel.expose
def select_model(model_type):
	if model_type =='DecisionTreeRegressor':
		model = DecisionTreeRegressor()
	elif model_type == 'RandomForestRegressor':
		model = RandomForestRegressor()
	elif model_type == 'GradientBoostingRegressor':
		model = GradientBoostingRegressor()
	else:
		model = "Model has not selected"
	return model.get_params()	

@eel.expose
def get_dataframe():
	root = Tk()
	# root.iconbitmap("./icon.ico")
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	file_path = filedialog.askopenfilename(filetypes=(("Data files", "*.csv;"),("All files", "*.*")))
	if file_path:
		json = pd.read_csv(file_path).to_json()
		return {'path':file_path, 'data':json}

# Haqiqiy sonni tekshirish
def isfloat(value):
	try:
		return bool(float(value))
	except ValueError:
		return False
#

# Mantiqiy qiymatlarni tekshirish	
def isBool(value):
	if value.capitalize() in ['True', 'False']:
		return True
	else:
		return False
#

# Mantiqiy qiymatga o'zgartitish
def my_bool(value):
	return True if value == 'true' else False
#

# Ma'lumotlarni tekshirish
def custom_model_setting(model_setting):
	custom_model_setting = model_setting
	for key, value in model_setting.items():
		if value.isdigit():
			custom_model_setting[key] = int(value)
		elif isfloat(value):
			custom_model_setting[key] = float(value)
		elif 	isBool(value):
			custom_model_setting[key] = my_bool(value)
		else:
			custom_model_setting[key] = value

	return custom_model_setting
#

#csv faylni tahrirlash
def change_csv_file(data_path, delete_columns,  predict_column, date_column, df_nan, df_train):
	try:
		df = pd.read_csv(data_path)
		df.drop(delete_columns, axis=1, inplace=True)
		if date_column:
			df[date_column] = pd.to_datetime(df[date_column])
			df['day']   = df[date_column].dt.day.astype(int)
			df['week']  = df[date_column].dt.weekday.astype(int)
			df['month'] = df[date_column].dt.month.astype(int)
			df['year']  = df[date_column].dt.year.astype(int)
			df['hour']  = df[date_column].dt.hour.astype(int)
			df['minute'] = df[date_column].dt.minute.astype(int)
			df['second'] = df[date_column].dt.second.astype(int)
			df.drop([date_column], axis=1, inplace=True)
		df.replace(['', 'N/A', 'unknown', '--'], np.nan, inplace=True)
		df.dropna(inplace=True)
		return df
	except ValueError as e:
		return str(e)


#
 
# Modellarni yaratish va bashoratni olish.
def create_model(model_type, model_setting):
	if model_type =='DecisionTreeRegressor':
		model = DecisionTreeRegressor()
	elif model_type == 'RandomForestRegressor':
		model = RandomForestRegressor()
	elif model_type == 'GradientBoostingRegressor':
		model = GradientBoostingRegressor()
	model.set_params(**model_setting)
	return model 

@eel.expose
def train_model(model_type, model_setting, data_path, delete_columns, predict_column, date_column, df_nan, df_train):
	# print(model_type, data_path, delete_columns, predict_column, date_column, df_nan, df_train)
	# print(model_setting)
	try:
		model_setting = custom_model_setting(model_setting)
		df = change_csv_file(data_path, delete_columns, predict_column, date_column, df_nan,  df_train)
		X = df.drop([predict_column], axis=1)
		y = df[[predict_column]]
		X_train, X_test, Y_train, Y_test = train_test_split(X, y, train_size=int(df_train)/100)
		model = create_model(model_type, model_setting)
		model = model.fit(X_train, Y_train.values.ravel()) 
	except ValueError as e:
		return str(e)
	
	predict = model.predict(X_test)
	r2 = r2_score(Y_test, predict)
	sample = [i for i in range(len(predict))]
	return {
			"df":df.to_json(),
			"Y_test":Y_test.values.ravel().tolist(),
			'predict':predict.tolist(),
			'r2_score' : r2,
			'sample':sample,
		   }

eel.start('index.html', size=(1400, 1050))

