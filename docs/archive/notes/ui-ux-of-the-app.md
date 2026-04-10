# UI/UX of the app

- when a user first comes to the app they have a view with three options,
  - there is a button to start a new pool comp
    - when clicked creates a new pool comp instance and goes to the pool comp view
  - there is a button to review data from historical pool comps
    - a data table with columns for historical pull comp data where each row represents a pool comp, and eachrow can be clicked on to bring up the pull view for each one so that more data of that pool comp can be seen
    - the table columns are: the date, the winner, the prize money, the number of players
  - there is a players button that takes you to a view that lists all the existing players where new players can be added and existing players can be edited
  - pool comp view
    - when clicked creates a new pool comp instance and goes to the pool comp view, where the pool comp is in an unstarted state and is waiting for the pull comp manager to add players to the pool comp, and then when the polcom manager decides to they can start the pool comp which trigger the app to randomly generate all the first round match ups
    - the app dynamically generatesa number of pool comp rounds based on the number of players in the pool comp,

# How the generate the tournament ui no matter how many players

Always build the tournament around the next power of 2.
That gives you a full bracket. Then:

- if player count is exactly that power of 2, no byes
- if player count is smaller, add byes into the empty slots
- if player count is bigger than the previous power of 2, that naturally creates a “play-in” round before the main bracket
  That single rule handles every player count.
