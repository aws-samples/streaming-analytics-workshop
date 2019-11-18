#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { WorkshopInfrastructure } from '../lib/workshop-infrastructure';
import { BuildWorkshopResources } from '../lib/build-workshop-resources';

const app = new cdk.App();

new WorkshopInfrastructure(app, 'StreamingAnalyticsWorkshop', {
    description: 'Creates all resources and compiles all artifacts that are required to run the streaming analytics workshop (shausma-streaming-analytics-workshop-self-paced)'
});

new WorkshopInfrastructure(app, 'StreamingAnalyticsWorkshopEventEngine', {
    description: 'Creates all resources and compiles all artifacts that are required to run the streaming analytics workshop (shausma-streaming-analytics-workshop-event-engine)'
});

new BuildWorkshopResources(app, 'BuildStreamingAnalyticsWorkshopResources');