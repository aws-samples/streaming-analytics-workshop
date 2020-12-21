---
title: "Additional Resources"
chapter: true
weight: 150
---

## Congratulations!
#### You have now seen what it takes to autoscale your applications based on a metric other than CPU Utilization. Feel free to use this script to customize your applications as you see fit.

#### Further details can be found on [GitHub](https://github.com/aws-samples/kda-flink-app-autoscaling).


### TODO: 
1. Fix CFN Template for Alarm to treat missing data as bad for scale in and good for scale out -- so if no data is coming it will force a scale in. Speak with Karthi to find out how you should adjust this because it's obviously not ideal for production workloads.
