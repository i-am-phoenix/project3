DROP TABLE fire_data;
CREATE TABLE fire_data (
	AcresBurned FLOAT,
	AdminUnit VARCHAR,
	ArchiveYear INT,
	County VARCHAR,
	Extinguished DATE,
	Fatalities INT,
	Latitude FLOAT, 
	FireLocation VARCHAR,
	Longitude FLOAT,
	FireName VARCHAR,
	SearchDescription VARCHAR,
	Started DATE,
	StructuresDamaged INT,
	StructuresDestroyed INT,
	StructuresEvacuated INT,
	StructuresThreatened INT,
	TimeStarted DATE,
	TimeExtinguished DATE,
	DayOfWeekStartedName VARCHAR,
	DayOfWeekStartedNum INT,
	Duration	FLOAT,
	Date_Established INT,
	Population_Jul_2019 INT,
	AreaSqMi	FLOAT,
	AreaKm2	FLOAT,
	PopDensityPerSqMi FLOAT,
	Caucus	VARCHAR
)

SELECT * FROM fire_data;