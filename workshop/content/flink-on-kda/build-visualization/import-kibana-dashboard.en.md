---
title: "Import Kibana dashboard"
chapter: false
weight: 20
---

Now that the Elasticsearch indices are in place, you can start to visualize the data in Kibana. As a shortcut for this workshop, we have already created a dashboard that you can import through the Kibana web interface.

1. Navigate to the Kibana management screen, select **Saved Object**, and then click on **Import**

	![](/images/flink-on-kda/kibana-2-import-objects.png)

1. A JSON file containing the definition of a suitable Kibana dashboard has already been downloaded to the *workshop-resources* folder located on the Windows desktop. Select the `streaming-analytics-workshop-dashboard.json` document from that folder and confirm with **Import** and **Done**.

	![](/images/flink-on-kda/kibana-3-upload-json.png)

1. After the visualization has been imported, select **Index Pattern**, select **pickup_count**, and choose it as the default index by clicking on the star.

	![](/images/flink-on-kda/kibana-4-default-index.png)
