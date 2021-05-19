---
title: "Add Elasticsearch sink"
chapter: false
weight: 30
---

Finally, we want to send the derived insights to Elasticsearch and Kibana for visualization. To this end, we use an Elasticsearch sink that has been extended to sign the requests with IAM credentials so that they are accepted by Amazon Elasticsearch Service.

{{< highlight java >}}
if (parameter.has("ElasticsearchEndpoint")) {
  String elasticsearchEndpoint = parameter.get("ElasticsearchEndpoint");
  final String region = parameter.get("Region", DEFAULT_REGION_NAME);

  //remove trailling /
  if (elasticsearchEndpoint.endsWith(("/"))) {
    elasticsearchEndpoint = elasticsearchEndpoint.substring(0, elasticsearchEndpoint.length()-1);
  }

  pickupCounts.addSink(AmazonElasticsearchSink.buildElasticsearchSink(
      elasticsearchEndpoint, region, "pickup_count", "_doc"));

  tripDurations.addSink(AmazonElasticsearchSink.buildElasticsearchSink(
      elasticsearchEndpoint, region, "trip_duration", "_doc"));
}
{{< / highlight >}}
