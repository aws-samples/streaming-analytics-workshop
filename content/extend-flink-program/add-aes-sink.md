---
title: "Add Elasticsearch sink"
chapter: false
weight: 30
---


To sent the results to Elasticsearch for visualization add an Elasticsearch sink to the Flink application after the `tripDurations` stream definition you've added in the previous step in Line 106-110.

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


