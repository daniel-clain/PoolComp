* if anything in context changes, all components that use context rerender regardless of whether it uses it

* its ok to receive an object with all data type, but when updating state, its better to break it down, because reassigning at a whole object level will treat everything as a change even if it hasnt
  - rerender isnt triggered from the value being different, its triggered from the value being re assigned: eg
    ~ if allData is {myNumber: 4} and you do setAllData({myNumber:4}) this counts as a change

* only put useContext in high level not low level, instead pass props down to low level, and use useMemo so the low level only rerenders if pertinent


* use useRef more