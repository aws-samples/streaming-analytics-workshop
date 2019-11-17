---
title: "Create Elasticsearch indices"
chapter: false
weight: 20
---

1. Navigate to the [Amazon Elasticsearch Sercive console](https://console.aws.amazon.com/es/) and choose the Elasticsearch domain that has been created by CloudFormation for this workshop. If you are unsure, you can verify the correct domain name in the output section of the CloudFormation template that you visited earlier.

1. Take a note of the **Endpoint** URL and copy the link to the **Kibana** dashboard

	![Elasticsearch domain details](/images/aes-domain-details.png)

1. Open Firefox on the Windows instance, eg, by double clicking the Firefox icon on the Desktop, and enter the Kibana URL you have just copied

	{{% notice info %}}
If you receive an error message that *User: anonymous is not authorized to perform: es:ESHttpGet*, verify that you are accessing Kibana from the Windows instance you connected to through RDP. You won't be able to access Kibana from your own device.
	{{% /notice %}}

1. When prompted by the Kibana welcome screen, choose **Explore on my own**

1. Navigate to the Kibana Dev Tools and confirm the dialog with **Get to work**. Create an Elasticsearch index for *pickup_count* documents with the following command:

	```
	PUT pickup_count?include_type_name=true
	{
	  "mappings": {
	    "pickup_count": {
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
	}
	```

	![Kibana create index](/images/kibana-1-create-index.png)

	{{% notice info %}}
If you encounter an *resource_already_exists_exception* exception, make sure that no instance of the Flink program is currently running and delete the existing index by executing the command `DELETE pickup_count`.
	{{% /notice %}}

1. Repeat the process to create a second index for *trip_duration* documents

	```
	PUT trip_duration?include_type_name=true
	{
	  "mappings": {
	    "trip_duration": {
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
	}
	```
