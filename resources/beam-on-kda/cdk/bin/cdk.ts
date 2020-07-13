#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { WorkshopInfrastructure } from '../lib/workshop-infrastructure';

const app = new cdk.App();

const synthDate = new Date().toISOString().split('T')[0];

new WorkshopInfrastructure(app, 'beam-workshop', {
    appName: 'beam-workshop',
    description: `Creates all resources and compiles all artifacts that are required to run the beam workshop (shausma-beam-workshop-self-paced-${synthDate})`,
    kinesisReplayVersion: 'release-0.1.0',
    beamApplicationVersion: 'master'
});