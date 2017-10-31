# Time Interval Select

A web time interval select tool that allows the user to indicate many non-overlapping time intervals during a day. The JS requires some HTML nodes with a specific id to bind its behavior to them. The interval data is stored (sorted) in a global variable called `scheduleData`.

## Warning! Sloppy Programming Ahead

This is the result of having to put together (with minimal to absolutely no expertisse) a basic system for reserving time in a schedule. Since the problem kept coming up in different scenarios, I decided to clean it up (kind of) and upload it. It's almost definitely not great, but maybe fine to some purposes. Although there's an explanation of how to get it working with no programming involved, it will surely need customization (maybe a total rewrite) for particular cases. This is the product of playful tinkering until something does the trick.

## Live example
There's a live example at http://www.ezequielwajs.com/timeIntervalSelect/

## Usage

The script requires the included file `styles.css` and jQuery to be loaded in the HTML previous to `timeintervalselect.js`. Bootstrap is recommended but not required (included with files and in the example `index.html`).

The script does not require any further user commands but it does require some HTML nodes to be named with specific ids. An alternative to this would be changing this id's in the source code or altering it altogether to produce the desired functionality. The source contains many functions to do checks and to manipulate the select tool.

List of Required HTML ID's:
* *startTimePlus*: a button or control that increases the lower bound of the interval.
* *startTimeMinus*: a button or control that decreases the lower bound of the interval.
* *startTime*: an input (`type="text"`) containing the lower bound value.
* *stopTimePlus*: a button or control that increases the upper bound of the interval.
* *stopTimeMinus*: a button or control that decreases the upper bound of the interval.
* *stopTime*: an input (`type="text"`) containing the upper bound value.
* *startMarker* and *stopMarker*: two divs containing a down pointing arrow or caret each (see example).
* *saveSlot*: a button or control that adds the current interval to the selection.
* *alertDiv*: an empty div that will contain the alert message for the user.
* *totalTime*: A span or p or some text element containing the total amount of hours selected.
