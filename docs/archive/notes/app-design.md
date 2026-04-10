# Key decisions for how the app is designed

- when I make this app I want to be able to provide it to people who manage the pool comp so that they can use it in a reliable way so that it is the preferred way of managing pool comp
  - all benefits and pros of the manual way must be considered and compared to all negatives and drawbacks of the app's way so that the managers of the pool comp have no reason to go back to the manual paper based way because the app is more efficient and reliable in every way.

# Reasons pool comp managers may give to revert back to the manual paper based way over the app, and how to counter

- manual way pro: the paper based way is a large sheet of paper so that players can easily see how the pool comp is progressing by glancing at it from a far
  - cons of app:
    - if the app is on a persons phone then the size of a phone is much smaller than an A4 sheet of paper and therefore harder for players to see at a glance how the comp is progressing
  - app counter:
    - the app could be on all player's phones where they can have access to view the active pool comp instance where they can see the state of the pool comp from their own device
      - cons of each player having the app on their phone
        - I would need to have the concept of type of users where some users are the pool comp manager and they are able to take actions and update the state of the pool comp, and then there would be the second type of user who canonly really view the state of the pool comp but they are unable to take any actions
    - the app can be designed for tablets so that the tablet is about the same size as an A4 sheet of paper and players can glance at from afar in the same way as they did with the paper
      - cons of table:
        - whole comp managers would need to own a tablet
        - a tablet is expensive and more risky to have in a public place where it may be stolen or damaged

- manual way pro: being able to fully free decisions at any point
  - cons of app:
    - if the app tries to establish a consistent pattern of pool comp then it may be restrictive. situations where the pool comp manager would want to do something that the app won't allow or hasn't been designed for
  - app counters:
    - the app could consider all the edge cases of scenarios where the pool comp manager may typically want the freedom to do, and have ui/ux features that enable all the types of free actions a pool comp manager may typically want to take
      - the pool camp would still provide its value by doing the main case scenario as the default that allow the pull comp manager to override any of these defaults at any time, for example:
        - the default date of the created pool is this date today but can be overwritten as any date
        - the entry price of the pool comp is $10but this is pool comp variable that is saved in the database that can be updated to a new value, either permanently for all pool comps going forward or just for that specific pool comp
        - a player may join the pool after it's been started and they will either take the place of a bye or another matchup
        - a player may need to leave the pooland therefore their position in the pool compass forfeit and their opponent moves on to the next round by default

- con of the app: if pool comp managers adopt the app system over the manual paper based system then they take on a big risk by losing control of the system and data and they are reliant on the person who maintains the app codebase, server hosting the app, the data base host and access. if the pool comp managers commit to Adopting the app, then that would mean they would have to abandoned their existing paper based way of doing it, and all their historical pool comp data records would be saved in a digital database but if they ever lost access to the app or this database then they would lose all the historical pool comp data records. the pool comp managers would be scared to adopt using the app because of loss of control of important historical pool comp data records. the pool comp managers would want reassurance that they will always have access to the historical records and aren't at risk of losing it.
  - manual way pros
    - pool comp managers are in direct control of historical data by having an A4 sheet of papera grid of columns and rows which they maintain and keep in a central place at the pub were different pool comp managers can I pick up from where they left off without risk of loss or loss of access to that historical data
  - manual way cons
    - the paper data records don't have the advantage of the digital reading the data and reporting valued statistics
  - app ideas to counter:
    - I like the idea of the data being savedto a mainstreamcloud storage system where all the pool comp managers have shared ownership over the data file
      - I'm thinking something like a Google Sheet xlsx file that is store in google drive that the primary pool comp manager has ownership over and can share full admin control to the other pool comp managers, and then those pool comp managers can choose to share that xlsx file with anyone. the app would point to this xlsx file as its database, and as pool comp managers take actions in the active pool comp instance, they can see that the data of that pool comp is added to the pool comp xlsx file, which builds up over time as each weeks pool comp is completed
      - the advantage is that, even if the pool comp app becomes unavailable, the pool comp managers will still have full access and control over the historical data, so at least that data is not lost and they can continue with manual system if the app fails them
      - the app can be hosted on an account that all pool comp managers haves admin access to, and the repo can be shared to other pool comp managers so that they have full control over repo. that way if the original developer becomes unavailable, then other people part of the comp can provide another developer access to the repo and the server so that the app can be maintained and fixed if neede without reliance on a single person
