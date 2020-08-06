import os
import boto3

client = boto3.client('emr')

def on_event(event, context):
    print(event)
    print(context)
    
    response = client.list_instances(
        ClusterId='j-2W7BT8LKR7AOY',
        InstanceGroupTypes=['MASTER']
    )

    instance_id = response['Instances'][0]['Ec2InstanceId']

    return { 'Data': { 'EmrMasterInstanceId': instance_id } }