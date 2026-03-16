import math

def boundingBox(lat,lng,radius_km):
    lat_diff=radius_km/111
    lng_diff = radius_km / (111 * math.cos(math.radians(lat)))


    min_lat=lat-lat_diff
    max_lat=lat+lat_diff
    min_lng=lng-lng_diff
    max_lng=lng+lng_diff

    print(f"{min_lat},{max_lat},{min_lng},{max_lng}")

    return min_lat,max_lat,min_lng,max_lng

def calculate_distance(lat1,lng1,lat2,lng2):
    R=6371

    dlat=math.radians(lat2-lat1)   ## diff in latitude
    dlng=math.radians(lng2-lng1)   ## diff in longitude

    a=(
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )

    print(a)

    c=2* math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R*c,2)
    
    



