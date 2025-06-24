
Map
A map has many hexes
Hexes have
  * coordinates


```mermaid
classDiagram
    class Map
    class Hex {
      int x_coordinate
      int y_coordinate
      string label
      boolean reconnoitered
      boolean claimed
    }

    Hex <-- Region : hasMany
    Region <-- Map : hasMany
    class Region {
      string name
    }
    Map --> Hex : hasMany
    class Player
    class User
    User --> Player
    class HexResource
    HexResource --> Resource : hasOne

    class Resource {
      string name
      int consumption_reduction
    }

    class Kingdom {
      int food
      int lumber
      int luxuries
      int ore
      int stone
    }

    class Note {
      string contents
      isPrivate()
    }


    Note --> Hex : belongsTo
    Note --> Map : belongsTo
    Note --> Player : belongsTo

    Settlement --> Hex : belongsTo
    class Settlement {
      string name
    }

    Settlement <-- SettlementBuilding
    Building <-- SettlementBuilding
    class SettlementBuilding
    class Building {
      string name
      string description
      string cost
    }

    Hex --> HexResource : hasMany
    Map --> Kingdom : hasOne
    Player <-- PlayerMap
    Map <-- PlayerMap
    class PlayerMap {
      isGM()
    }
```



resources

| id | name        | ore_generation | food_generation | lumber_generation |
|----|-------------|----------------|-----------------|-------------------|
| 1  | mine        | 1              | 0               |                   |
| 2  | farm        | 0              | 1               |                   |
| 3  | lumber mill | 0              | 0               | 1                 |