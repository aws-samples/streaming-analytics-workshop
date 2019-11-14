#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();

new CdkStack(app, 'StreamingAnalyticsWorkshop', {
    description: 'Creates all resources and compiles all artifacts that are required to run the streaming analytics workshop (shausma-streaming-analytics-workshop-self-paced)'
});
