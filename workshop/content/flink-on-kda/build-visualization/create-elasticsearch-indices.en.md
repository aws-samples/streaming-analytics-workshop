---
title: "Create Elasticsearch indices"
chapter: false
weight: 20
---

Elasticsearch stores data in indices. But although Elasticsearch will automatically create indices if you start to ingest data, it will fail to derive the correct data types. So you first need to manually create indices with the correct data types for the geo spacial location information.

1. Navigate to the [Amazon Elasticsearch Service console](https://console.aws.amazon.com/es/) and choose the Elasticsearch domain that has been created by CloudFormation for this workshop. If you are unsure, you can verify the correct domain name in the output section of the CloudFormation template that you visited earlier.

1. Take a note of the **Endpoint** URL and copy the link to the **Kibana** dashboard

	![Elasticsearch domain details](/images/flink-on-kda/aes-domain-details.png)

1. Open Firefox on the Windows instance, eg, by double clicking the Firefox icon on the Desktop, and enter the Kibana URL you have just copied

	{{% notice info %}}
If you receive an error message that *User: anonymous is not authorized to perform: es:ESHttpGet*, verify that you are accessing Kibana from the Windows instance you connected to through RDP. You won't be able to access Kibana from your own device.
	{{% /notice %}}

1. When prompted by the Kibana welcome screen, choose **Explore on my own**

1. Navigate to the Kibana Dev Tools and confirm the dialog with **Get to work**

	![Kibana create index](/images/flink-on-kda/kibana-1-create-index.png)

1. Create an Elasticsearch index for *pickup_count* documents with the following command. Make sure your cursor is *marking a line* of the command to execute it.

	{{< highlight plain>}}
PUT pickup_count
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      },
      "pickup_count": {
        "type": "long"
      },
      "timestamp": {
        "type": "date"
      }
    }
  }
}
{{< /highlight >}}


	{{% notice info %}}
If you encounter an *resource_already_exists_exception* exception, make sure that the Flink application is currently not running and delete the existing index by executing the command `DELETE pickup_count`.
	{{% /notice %}}

1. Repeat the process to create a second index for *trip_duration* documents

	{{< highlight plain>}}
PUT trip_duration
{
  "mappings": {
    "properties": {
      "airport_code": {
        "type": "keyword"
      },
      "location": {
        "fields": {
          "raw": {
            "type": "keyword"
          }
        },
        "type": "geo_point"
      },
      "timestamp": {
        "type": "date"
      }
    }
  }
}
{{< /highlight >}}
