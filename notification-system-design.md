# Notification System Design

##Approch

1. Priority is calculated using Priority score 
   priority score  = (type weight * 10000) + Recency score 

   and I have given the weights as 
   i. Placement = 3
  ii. Result = 2
 iii. Event = 1 

 and i have taken Placement > Result > Event as priority

2. Recency Score

Recent notifications receive a higher score.
Older notifications gradually lose priority.

## Algorithm

1. Ignore all read notifications.
2. Calculate priority score.
3. Maintain only Top 10 notifications using a Min Heap.
4. Whenever I get the new notification:
   - Calculate its priority.
   - If heap size < 10:
       Insert.
   - Else compare with smallest priority.
       If larger:
          Remove smallest.
          Insert new notification.