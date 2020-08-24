+++
title = "Start Flink Cluster on Amazon Elastic Map Reduce"
menuTitle = "Start Flink Cluster on EMR"
date = 2020-07-10T10:27:27+02:00
weight = 20
+++

1. Connect to the Amazon EMR cluster. Follow the link for **ConnectToEmrCluster** in the output section of the CloudFormation template to connect to the cluster.

	{{% notice info %}}
We are using [Amazon Session Manager Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html) to connect to the cluster through the browser and without exposing the cluster directly over the public internet. Amazon EMR is already preconfigured with this capability. To enable the functionality, we just need to [app permissions to use the capability](https://docs.aws.amazon.com/systems-manager/latest/userguide/getting-started-add-permissions-to-existing-profile.html) to the cluster.
{{% /notice %}}

	![cf-emr-connect](/images/beam-on-kda/cf-emr-connect.png)


2. Change to the correct user by issuing the following command:

	{{< highlight plain >}}
sudo su - hadoop
{{< /highlight >}}

1. Apache Flink is included in the Amazon EMR distribution and has been installed on the cluster. To start the Flink JobManager, execute the following command

	{{< highlight plain >}}
flink-yarn-session -n 2 -s 4 -tm 16GB -d
{{< /highlight >}}

1. To connect to the Flink UI, we first need to open to the [Amazon EMR console](https://console.aws.amazon.com/elasticmapreduce)

1. Navigate to the details of the cluster by clicking on the cluster named beam-workshop and copy the **Master public DNS**

	![](/images/beam-on-kda/emr-copy-dns-name.png)

1. Open Firefox on the Windows instance and navigate to the Hadoop ResourceManager by appending the port `:8088` to the DNS name you have just copied

	{{% notice warning %}}
You can only access the ResourceManager from the Windows instance, it is not available from the public internet. If you are having problems to connect, make sure that you have appended the port correctly and you are connecting from the Windows development environment.
{{% /notice %}}

1. Follow the link labeled **ApplicationMaster** to access the Flink Dashboard

	![](/images/beam-on-kda/emr-resource-manager-application.png)

1. You are now presented with the Apache Flink dashboard that allows you to interact with the different components of the runtime

	![](/images/beam-on-kda/emr-flink-dashboard-overview.png)
