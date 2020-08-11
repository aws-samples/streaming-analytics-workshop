import os
import boto3
import cfnresponse

client = boto3.client('emr')

def get_instance_id(event, context):
    response = client.list_instances(
        ClusterId=event['ResourceProperties']['EmrId'],
        InstanceGroupTypes=['MASTER']
    )

    instance_id = response['Instances'][0]['Ec2InstanceId']

    responseData = { 'EmrMasterInstanceId': instance_id }

    cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData)