#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { WorkshopInfrastructure } from '../lib/workshop-infrastructure';
import { BuildWorkshopResources } from '../lib/build-workshop-resources';

const app = new cdk.App();

const synthDate = new Date().toISOString().split('T')[0];

new WorkshopInfrastructure(app, 'StreamingAnalyticsWorkshop', {
    description: `Creates all resources and compiles all artifacts that are required to run the streaming analytics workshop (shausma-streaming-analytics-workshop-self-paced-${synthDate})`,
    flinkVersion: '1.11.2',
    flinkScalaVersion: '2.11',
    kinesisReplayVersion: 'release-0.1.0',
    consumerApplicationVersion: 'release-0.2.0',
    consumerApplicationJarObject: 'amazon-kinesis-analytics-taxi-consumer-0.2.0.jar'
});

new WorkshopInfrastructure(app, 'StreamingAnalyticsWorkshopEventEngine', {
    description: `Creates all resources and compiles all artifacts that are required to run the streaming analytics workshop (shausma-streaming-analytics-workshop-event-engine-${synthDate})`,
    flinkVersion: '1.11.2',
    flinkScalaVersion: '2.11',
    kinesisReplayVersion: 'release-0.1.0',
    consumerApplicationVersion: 'release-0.2.0',
    consumerApplicationJarObject: 'amazon-kinesis-analytics-taxi-consumer-0.2.0.jar'
});

new BuildWorkshopResources(app, 'BuildStreamingAnalyticsWorkshopResources');