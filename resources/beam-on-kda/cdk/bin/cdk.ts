#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { WorkshopInfrastructure } from '../lib/workshop-infrastructure';

const app = new cdk.App();

const synthDate = new Date().toISOString().split('T')[0];

new WorkshopInfrastructure(app, 'BeamWorkshop', {
    description: `Creates all resources and compiles all artifacts that are required to run the beam workshop (shausma-beam-workshop-self-paced-${synthDate})`,
    flinkVersion: '1.8.2',
    flinkScalaVersion: '2.11',
    kinesisReplayVersion: 'release-0.1.0',
    consumerApplicationVersion: 'release-0.2.0',
    consumerApplicationJarObject: 'amazon-kinesis-analytics-taxi-consumer-0.2.0.jar'
});