---
title: "Add Elasticsearch sink"
chapter: false
weight: 30
---

Add an Elasticsearch sink to the Flink program to sent the results to Elasticsearch for visualization after the `tripDurations` stream definition in Line 106-110.

{{% notice warning %}}
This code won't work right away. Before you can test this modification, we need to configure Elasticsearch and pass the parameter of the Elasticsearch endpoint to the Flink program. We'll get to it in a minute.
{{% /notice %}}

<!--"linenos=table,linenostart=108"-->
{{< highlight java>}}
if (parameter.has("ElasticsearchEndpoint")) {
  String elasticsearchEndpoint = parameter.get("ElasticsearchEndpoint");
  final String region = parameter.get("Region", DEFAULT_REGION_NAME);

  //remove trailling /
  if (elasticsearchEndpoint.endsWith(("/"))) {
    elasticsearchEndpoint = elasticsearchEndpoint.substring(0, elasticsearchEndpoint.length()-1);
  }

  pickupCounts.addSink(AmazonElasticsearchSink.buildElasticsearchSink(elasticsearchEndpoint, region, "pickup_count", "pickup_count"));
  tripDurations.addSink(AmazonElasticsearchSink.buildElasticsearchSink(elasticsearchEndpoint, region, "trip_duration", "trip_duration"));
}
{{< / highlight >}}


