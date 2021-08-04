---
title: "Profiling Apache Beam pipeline using Amazon CodeGuru"
menuTitle: "Profiling pipelines"
chapter: false
weight: 10
---

One of the most common causes of failures and slowdowns in streaming applications managed by Amazon Kinesis Data Analytics is *Java virtual machines* running out of memory. This section will help you detect and troubleshoot out-of-memory (*OOM*) conditions in your application using **Amazon CodeGuru** profiler.

1. Navigate to [Amazon CodeGuru Console](https://console.aws.amazon.com/codeguru/profiler/) and select **Profiling Groups** from the menu on the left.

2. Create a new profiling group by clicking on the **Create profiling group** button.

3. Use `flink-beam-app` for the name your profiling group and click Create.

   ![](/images/beam-on-kda/profiler-group-1.png)

4. Once you have created the group, navigate back to the profiling groups [landing page](https://console.aws.amazon.com/codeguru/profiler/) and you should see the newly created group in the list of profiling groups. Select the radio button to theleft of the newly created group and select **Manage Permissions** from the **Actions** menu as shown below.

   ![](/images/beam-on-kda/profiler-group-2.png)

5. From the list of IAM users and roles, select the `KdaRole`. If you are attending an AWS hosted event, select the only role that is suggested. If you are running the workshop on your own, select the role that contains `KdaRole`.

   ![](/images/beam-on-kda/profiler-group-3.png)

6. The Apache Beam application is already instrumented and includes the Amazon CodeGuru profiler agent. 
   {{< highlight java >}}
    // Setup the profiler
    if (!StringUtils.isNullOrEmpty(this.codeGuruProfilingGroupName)) {
      Profiler.builder()
          .profilingGroupName(this.codeGuruProfilingGroupName)
          .withHeapSummary(true)
          .build()
          .start();
    }
{{</ highlight >}}
   
   Please visit [Amazon CodeGuru documentation](https://docs.aws.amazon.com/codeguru/latest/profiler-ug/enabling-the-agent-with-code.html) to learn more about profiling your application.

7. In this step, you will modify the Amazon Kinesis Data Analytics application configuration to trigger the instrumentation. Navigate to the [Kinesis Data Analytics console](https://console.aws.amazon.com/kinesisanalytics/home#/applications/dashboard) and select the application you have created earlier

8. Press the blue **Configure** button next to the name of the application

9. Expand the properties section, select the **BeamApplicationProperties** group and click on **Edit group**

10. Add a row with the *Key* `CodeGuruProfilingGroupName` and the *Value* `flink-beam-app` and change **Source** back to `kinesis`.
   ![](/images/beam-on-kda/profiler-group-4.png)

11. Confirm these changes by pressing **Save**. Apply the changes to the application by pressing **Update** at the bottom of the page. Once you have updated the settings, your application will be redeployed which takes 1-2 minutes.

12. In a few minutes, you will be able to gain valuable insights from Amazon CodeGuru Profiler.
   ![](/images/beam-on-kda/profiler-group-5.png)
