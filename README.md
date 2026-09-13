# Acton Calendar Demo

Prototype of a calendar view for scheduling challenges and launches in a badge in Acton's Journey Tracker. 

Copied two Journey Tracker pages using OneFile browser plugin. Code is for new UI demonstration only and should not be used in production.

Includes two calendar views:
1. A simple calendar visible from the badge overview page when changing the start date and delivery days
2. A more feature-rich calendar on the detailed date/time editor

The latter calendar has the following features:
1. See clearly how the quest is scheduled out beginning to end, and how the weeks/sections flow
2. Move all items on a day to another day (useful for scheduling around holidays and special events)
3. Swap two days (useful, for example, if the quest activities for a day are outside, but it's supposed to rain)
4. Move a single challenge to another day via drag and drop (if you didn't get to it, or it's unscheduled/bonus)
5. Move a section/group of challenges from a day
6. Move entire weeks by click and drag (Adding week 6 to a 5 week quest)
7. Undo with ctrl + z
8. Reset, save, and cancel buttons

A guided tour walks through both calendars, starting on the badge overview page. It opens on a first visit, and "Take the tour" in the notice at the bottom of either page starts it again.

Also, for convenience, added save/cancel buttons at the bottom of each div on the page, and a reset to defaults button to return to the original state before any edits.
