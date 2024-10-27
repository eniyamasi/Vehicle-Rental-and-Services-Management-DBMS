import pandas as pd

# Create the updated dataset
data = {
    "Num": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    "Seater": [5, 7, 5, 4, 5, 4, 8, 5, 5, 7, 4, 6, 4, 5, 4, 7, 5, 6, 4, 7, 4, 5, 4, 6, 5],
    "AC_Type": ["Available", "Not Available", "Available", "Not Available", "Available", "Available", "Available", 
                "Not Available", "Available", "Available", "Not Available", "Available", "Available", 
                "Available", "Available", "Available", "Available", "Not Available", "Available", 
                "Available", "Not Available", "Available", "Available", "Available", "Available"],
    "Fuel": ["Petrol", "Diesel", "Electric", "Petrol", "Diesel", "Petrol", "Diesel", "Petrol", "Hybrid", "Diesel", 
             "Petrol", "Diesel", "Electric", "Petrol", "Petrol", "Diesel", "Electric", "Diesel", "Petrol", 
             "Diesel", "Petrol", "Hybrid", "Electric", "Diesel", "Petrol"],
    "Fastag": ["Available", "Not Available", "Available", "Available", "Not Available", "Available", "Not Available", 
               "Available", "Available", "Not Available", "Not Available", "Available", "Available", 
               "Available", "Not Available", "Available", "Available", "Available", "Not Available", 
               "Available", "Available", "Available", "Available", "Not Available", "Available"],
    "Distance": [25000, 50000, 15000, 30000, 45000, 35000, 60000, 20000, 10000, 55000, 60000, 70000, 12000, 22000, 
                 45000, 60000, 18000, 80000, 40000, 35000, 38000, 15000, 8000, 75000, 27000],
    "Year": [2020, 2018, 2022, 2019, 2021, 2017, 2016, 2023, 2022, 2019, 2015, 2016, 2021, 2020, 2018, 2017, 2023, 
             2015, 2017, 2020, 2019, 2021, 2023, 2017, 2022],
    "Variant": ["Sedan", "SUV", "Hatchback", "Coupe", "SUV", "Hatchback", "Van", "Sedan", "Sedan", "SUV", "Coupe", 
                "SUV", "Hatchback", "Sedan", "Hatchback", "SUV", "Sedan", "Van", "Coupe", "SUV", "Hatchback", "SUV", 
                "Coupe", "SUV", "Sedan"],
    "Rental_Amount": [1500, 1600, 1800, 1100, 1400, 1200, 1700, 1400, 1900, 1800, 1000, 2000, 1700, 1600, 1300, 2100, 
                      1900, 1500, 1100, 2000, 1200, 2300, 1800, 1900, 1500]
}

# Convert to DataFrame
df = pd.DataFrame(data)

# Save to CSV
csv_file_path = "vehicle_rental_data.csv"
df.to_csv(csv_file_path, index=False)

csv_file_path
