import numpy as np
import pandas as pd
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import json
from flask import Flask, jsonify

# Custom function to convert DF into geoJSON format
def df_to_geojson(df, properties, lat='latitude', lon='longitude'):
    # create a new python dict to contain our geojson data, using geojson format
    geojson = {'type':'FeatureCollection', 'features':[]}

    # loop through each row in the dataframe and convert each row to geojson format
    for _, row in df.iterrows():
        # create a feature template to fill in
        feature = {'type':'Feature',
                   'properties':{},
                   'geometry':{'type':'Point',
                               'coordinates':[]}}

        # fill in the coordinates
        feature['geometry']['coordinates'] = [row[lon],row[lat]]

        # for each column, get the value and add it as a new feature property
        for prop in properties:
            if type(row[prop]) != str:
                feature['properties'][prop] = str(row[prop])
            else :
                feature['properties'][prop] = row[prop]
        
            # add this feature (aka, converted dataframe row) to the list of features inside our dict
            geojson['features'].append(feature)
    
    return geojson

# Database Setup
# setup connection
rds_connection_string = "postgres:postgres@localhost:5432/ca_fire"
engine = create_engine(f'postgresql://{rds_connection_string}')

# pull table names
table_name = engine.table_names()[0] # fire_data

# Flask Setup
app = Flask(__name__)

# Flask Routes

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f'<strong style="font-family: "Arial";>Available Routes:</strong><br>'
        f"/longest_fires<br>"
        f"/largest_fires<br>"
        f"/deadliest_fires<br>"
        f"/all_fires<br>"
    )

@app.route("/longest_fires")
def byDuration():
    # FLask path 1: Pull data for top 10 longest burning fires in each year
    query_top_fires_duration = """
    SELECT firename, firelocation, archiveyear, started, extinguished, latitude, longitude, 
       acresburned, fatalities, dayofweekstartedname, dayofweekstartednum,
       duration, county, caucus, year_rank 
    FROM (
	SELECT
		*, 
		RANK () OVER ( 
			PARTITION BY p.archiveyear
			ORDER BY duration DESC
		) year_rank 
	FROM
		fire_data p)
    AS x WHERE year_rank < 11
    """
    # Execute sql query 
    data_top_fires_duration = engine.execute(query_top_fires_duration)  

    df_test = pd.read_sql(query_top_fires_duration, con=engine)

    # Pull data table column names
    table_headers = engine.execute(query_top_fires_duration)._metadata.keys

    # convert to DF
    df_top_fires_duration = pd.DataFrame(data_top_fires_duration, columns=table_headers)
    # df_top_fires_duration.head()

    # Convert refined data frame to geoJSON format
    top_fires_duration_geoJSON = df_to_geojson(df_test, 
        df_test.drop(['latitude','longitude'], axis=1).columns)
    # top_fires_duration_geoJSON

    # Write geoJSON to json file for plotting
    with open("fires4plotting.json", "w") as output:
        json.dump(top_fires_duration_geoJSON, output)

    return jsonify(top_fires_duration_geoJSON)


@app.route("/largest_fires")
def bySize():
    # FLask path 3: Pull data for top 10 deadliest fires overall
    query_largest = """
    SELECT firename, firelocation, archiveyear, started, extinguished, latitude, longitude, 
        acresburned, fatalities, dayofweekstartedname, dayofweekstartednum,
        duration, county, caucus
    FROM fire_data WHERE fatalities > 0 ORDER BY fatalities DESC LIMIT 10
    """
    # Execute sql query 
    data_largest_fires = engine.execute(query_largest)  

    # Pull data table column names
    table_headers = engine.execute(query_largest)._metadata.keys

    # convert to DF
    df_largest = pd.DataFrame(data_largest_fires, columns=table_headers)
    # df_largest

    # Convert refined data frame to geoJSON format
    top_fires_largest_geoJSON = df_to_geojson(df_largest , df_largest.drop(['latitude','longitude'], axis=1).columns)
    # daedliest_fires_geoJSON

    # Write geoJSON to json file for plotting
    with open("fires4plotting.json", "w") as output:
        json.dump(top_fires_largest_geoJSON, output)

    return jsonify(top_fires_largest_geoJSON)


@app.route("/deadliest_fires")
def byFatality():
    # FLask path 3: Pull data for top 10 deadliest fires overall
    query_deadliest = """
    SELECT firename, firelocation, archiveyear, started, extinguished, latitude, longitude, 
        acresburned, fatalities, dayofweekstartedname, dayofweekstartednum,
        duration, county, caucus
    FROM fire_data WHERE fatalities > 0 ORDER BY fatalities DESC LIMIT 10
    """
    # Execute sql query 
    data_deadliest_fires = engine.execute(query_deadliest)  

    # Pull data table column names
    table_headers = engine.execute(query_deadliest)._metadata.keys

    # convert to DF
    df_deadliest = pd.DataFrame(data_deadliest_fires, columns=table_headers)
    # df_deadliest


    # Convert refined data frame to geoJSON format
    top_fires_deadliest_geoJSON = df_to_geojson(df_deadliest , df_deadliest.drop(['latitude','longitude'], axis=1).columns)
    # daedliest_fires_geoJSON

    # Write geoJSON to json file for plotting
    with open("fires4plotting.json", "w") as output:
        json.dump(top_fires_deadliest_geoJSON, output)

    return jsonify(top_fires_deadliest_geoJSON)


@app.route("/all_fires")
def all():
    # setup connection
    rds_connection_string = "postgres:postgres@localhost:5432/ca_fire"
    engine = create_engine(f'postgresql://{rds_connection_string}')

    # pull table names
    table_name = engine.table_names()[0] # fire_data

    # FLask path 4: Pull data for all fires
    query_all = """
    SELECT * FROM fire_data;
    """
    # Execute sql query 
    data_all_fires = engine.execute(query_all)  

    # Pull data table column names
    table_headers = engine.execute(query_all)._metadata.keys

    # convert to DF
    df_all_fires = pd.DataFrame(data_all_fires, columns=table_headers)
    # df_deadliest

    # Convert refined data frame to geoJSON format
    all_fires_geoJSON = df_to_geojson(df_all_fires , df_all_fires.drop(['latitude','longitude'], axis=1).columns)
    # daedliest_fires_geoJSON

    # Write geoJSON to json file for plotting
    with open("fires4plotting.json", "w") as output:
        json.dump(all_fires_geoJSON, output)

    return jsonify(all_fires_geoJSON)


if __name__ == '__main__':
    app.run(debug=True)
