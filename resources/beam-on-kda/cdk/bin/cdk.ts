#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { WorkshopInfrastructure } from '../lib/workshop-infrastructure';

const app = new cdk.App();

const synthDate = new Date().toISOString().split('T')[0];

const dependencies = {
    kinesisReplayVersion: 'release-0.1.0',
    beamApplicationVersion: 'release-0.2.0',
    beamApplicationJarFile: 'amazon-kinesis-analytics-beam-taxi-consumer-0.2.0.jar',
}

new WorkshopInfrastructure(app, 'streaming-analytics-workshop-beam', {
    appName: 'beam-workshop',
    description: `Creates all resources and compiles all artifacts that are required to run the beam workshop (shausma-beam-workshop-self-paced-${synthDate})`,
    eventEngine: false,
    ...dependencies
});

new WorkshopInfrastructure(app, 'streaming-analytics-workshop-beam-event-engine', {
    appName: 'beam-workshop',
    description: `Creates all resources and compiles all artifacts that are required to run the beam workshop (shausma-beam-workshop-ee-${synthDate})`,
    eventEngine: true,
    ...dependencies
});