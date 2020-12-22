'''
Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
'''

import boto3
import json
import os

client_kda = boto3.client('kinesisanalyticsv2')
client_ssm = boto3.client('ssm')
client_cloudwatch = boto3.client('cloudwatch')
client_cloudformation = boto3.client('cloudformation')
client_aas = boto3.client('application-autoscaling')
client_iam = boto3.resource('iam')

PARAMETER_STORE = os.environ['ParameterStore']


def update_parallelism(context, desiredCapacity, resourceName, appVersionId):
    # Update parallelism to the new Desired Capacity value
    try:
        response = client_kda.update_application(
            ApplicationName=resourceName,
            CurrentApplicationVersionId=appVersionId,
            ApplicationConfigurationUpdate={
                'FlinkApplicationConfigurationUpdate': {
                    'ParallelismConfigurationUpdate': {
                        'ConfigurationTypeUpdate': 'CUSTOM',
                        'ParallelismUpdate': int(desiredCapacity),
                        'AutoScalingEnabledUpdate': False
                    }
                }
            }
        )

        print("In update_parallelism; response: ")
        print(response)
        scalingStatus = "InProgress"
        
        put_alarms(context, desiredCapacity)

    # In case of error of updating the sharding, raise an exception.
    except Exception as e:
        print(e)
        failureReason = str(e)
        scalingStatus = "Failed"
        pass

    return scalingStatus


def put_alarms(context, curr_capacity):
    try:
        
        scaling_policies = get_scaling_policies(context)
        if not scaling_policies:
            print("ERROR: Unable to get scaling_policies")
            return
        
        if curr_capacity > 1:
            # scale in alarm (for curr_capacity > 1)
            scalein_policy_arn = scaling_policies['KDAScaleIn']
            print("scalein_policy_arn: " + scalein_policy_arn)
            if not scalein_policy_arn:
                print("ERROR - scalein_policy_arn is None in put_alarms")
                return

            client_cloudwatch.put_metric_alarm(
                AlarmName=get_cloudwatch_alarm_in(),
                AlarmDescription='KDA scale in alarm',
                Metrics=[
                    {
                        "Expression": "FILL(ir/60, 0)",
                        "Id": "ad1",
                        "ReturnData": False
                    },
                    {
                        "Id": "ir",
                        "MetricStat": {
                            "Metric": {
                                "Dimensions": [
                                    {
                                        "Value": get_kinesis_stream(),
                                        "Name": "StreamName"
                                    }
                                ],
                                "MetricName": "IncomingRecords",
                                "Namespace": "AWS/Kinesis"
                            },
                            "Period": 60,
                            "Stat": "Sum"
                        },
                        "ReturnData": True
                    }
                ],
                Threshold=(curr_capacity-1)*get_max_throughput_per_kpu(),
                ComparisonOperator='LessThanOrEqualToThreshold',
                AlarmActions=[
                    scalein_policy_arn
                ],
                EvaluationPeriods=2,
                TreatMissingData=get_how_to_treat_missing_data(curr_capacity))
        elif curr_capacity <= 1:
            # scale in alarm (for capacity <= 1)
            client_cloudwatch.put_metric_alarm(
                AlarmName=get_cloudwatch_alarm_in(),
                AlarmDescription='KDA scale in alarm',
                Metrics=[
                    {
                        "Expression": "FILL(ir/60, 0)",
                        "Id": "ad1",
                        "ReturnData": False
                    },
                    {
                        "Id": "ir",
                        "MetricStat": {
                            "Metric": {
                                "Dimensions": [
                                    {
                                        "Value": get_kinesis_stream(),
                                        "Name": "StreamName"
                                    }
                                ],
                                "MetricName": "IncomingRecords",
                                "Namespace": "AWS/Kinesis"
                            },
                            "Period": 60,
                            "Stat": "Sum"
                        },
                        "ReturnData": True
                    }
                ],
                Threshold=0,
                ComparisonOperator='LessThanOrEqualToThreshold',
                EvaluationPeriods=2)

        if curr_capacity < get_max_kpus():
            # scale out alarm
            scaleout_policy_arn = scaling_policies['KDAScaleOut']
            print("scaleout_policy_arn: " + scaleout_policy_arn)
            if not scaleout_policy_arn:
                print("ERROR - scaleout_policy_arn is None in put_alarms")
                return
    
            client_cloudwatch.put_metric_alarm(
                AlarmName=get_cloudwatch_alarm_out(),
                AlarmDescription='KDA scale out alarm',
                Metrics=[
                    {
                        "Expression": "FILL(ir/60, 0)",
                        "Id": "ad1",
                        "ReturnData": False
                    },
                    {
                        "Id": "ir",
                        "MetricStat": {
                            "Metric": {
                                "Dimensions": [
                                    {
                                        "Value": get_kinesis_stream(),
                                        "Name": "StreamName"
                                    }
                                ],
                                "MetricName": "IncomingRecords",
                                "Namespace": "AWS/Kinesis"
                            },
                            "Period": 60,
                            "Stat": "Sum"
                        },
                        "ReturnData": True
                    }
                ],
                Threshold=curr_capacity*get_max_throughput_per_kpu(),
                ComparisonOperator='GreaterThanOrEqualToThreshold',
                AlarmActions=[
                    scaleout_policy_arn
                ],
                EvaluationPeriods=1)
    except Exception as e:
        print("ERROR - Exception in put_alarms")
        print(e)


def get_cloudwatch_alarm_in():
    try:
        return os.environ['CloudWatchAlarmNameIn']
    except Exception as e:
        print ("ERROR - Exception in get_cloudwatch_alarm_in")
        print(e)


def get_cloudwatch_alarm_out():
    try:
        return os.environ['CloudWatchAlarmNameOut']
    except Exception as e:
        print ("ERROR - Exception in get_cloudwatch_alarm_out")
        print(e)


def get_kinesis_stream():
    try:
        return os.environ['KinesisStreamName']
    except Exception as e:
        print ("ERROR - Exception in get_kinesis_stream")
        print(e)


def get_max_throughput_per_kpu():
    try:
        return int(os.environ['MaxThroughputPerKPU'])
    except Exception as e:
        print ("ERROR - Exception in get_max_throughput_per_kpu")
        print(e)


def get_max_kpus():
    try:
        return int(os.environ['MaxKPUs'])
    except Exception as e:
        print ("ERROR - Exception in get_max_kpus")
        print(e)


# Trick for getting API resource id (need to void circular dependency issue in CFN template)
def get_resource_id(context):
    try:
        function_name = context.function_name
        stack_name = context.function_name.split('LambdaScaler')[0][:-1]

        response = client_cloudformation.describe_stack_resource(
            StackName=stack_name,
            LogicalResourceId='ScalerApi'
        )

        ApiId = response['StackResourceDetail']['PhysicalResourceId']

        ApiResourceId = "https://" + ApiId + ".execute-api." + os.environ['AWS_REGION'] + ".amazonaws.com/prod/scalableTargetDimensions/" + os.environ['KDAAppName']

        return ApiResourceId
    except Exception as e:
        print("Exception in get_resource_id: " + str(e))
        return None


def get_scaling_policies(context):
    try:
        resource_id = get_resource_id(context)
        response = client_aas.describe_scaling_policies(
            PolicyNames=[
                'KDAScaleIn',
                'KDAScaleOut'
                ],
            ServiceNamespace='custom-resource',
            ResourceId=resource_id,
            ScalableDimension='custom-resource:ResourceType:Property',
            MaxResults=2)
        scaling_policies = response['ScalingPolicies']
        if len(scaling_policies) == 2:
            print("Found 2 scaling policies as expected")

            response = {
                scaling_policies[0]['PolicyName']: scaling_policies[0]['PolicyARN'],
                scaling_policies[1]['PolicyName']: scaling_policies[1]['PolicyARN']
            }
            
            print(response)
            
            return response
        else:
            print("Found " + str(len(scaling_policies)) + " scaling policies")
            return None
    except Exception as e:
        print("ERROR - Exception in get_scaling_policies")
        print(e)
        return None


# trick for getting customer role ARN (need to void circular dependency issue in CFN template)
def get_custom_role_arn(context):
    try:
        function_name = context.function_name
        stack_name = context.function_name.split('LambdaScaler')[0][:-1]

        response = client_cloudformation.describe_stack_resource(
            StackName=stack_name,
            LogicalResourceId='CustomApplicationAutoScalingServiceRole'
        )

        CustomRoleId = response['StackResourceDetail']['PhysicalResourceId']
        role = client_iam.Role(CustomRoleId)
        
        return role.arn
    except Exception as e:
        print("Exception in get_resource_id: " + str(e))
        return None


def response_function(status_code, response_body):
    return_json = {
        'statusCode': status_code,
        'body': json.dumps(response_body) if response_body else json.dumps({}),
        'headers': {
            'Content-Type': 'application/json',
        },
    }
    # log response
    print(return_json)
    return return_json


def lambda_handler(event, context):
    # log the event
    print("Calling lambda scaler for kda - " + json.dumps(event))

    # get KDA app name
    if 'scalableTargetDimensionId' in event['pathParameters']:
        resourceName = event['pathParameters']['scalableTargetDimensionId']
        print("Fetching resource name in kda scaler - " + resourceName)
    else:
        message = "Error, scalableTargetDimensionId not found"
        return response_function(400, str(message))

    # get details for the KDA app in question
    try:
        response = client_kda.describe_application(
            ApplicationName=resourceName
        )

        print("In kda scaler, response from kda.describe_application")
        print(response)

        appVersion = response["ApplicationDetail"]["ApplicationVersionId"]
        applicationStatus = response["ApplicationDetail"]["ApplicationStatus"]
        parallelism = response["ApplicationDetail"]["ApplicationConfigurationDescription"][
            "FlinkApplicationConfigurationDescription"]["ParallelismConfigurationDescription"]["Parallelism"]
        actualCapacity = parallelism
    except Exception as e:
        print("Exception in kda scaler: " + str(e))
        message = "Error, cannot find a kinesis data analytics app called " + resourceName
        return response_function(404, message)

    # try to retrive the desired capacity from ParameterStore

    response = client_ssm.get_parameter(
        Name=PARAMETER_STORE
    )
    print("In kda scaler, just called ssm.get_parameter (1)")
    print(response)
    

    if 'Parameter' in response:
        if 'Value' in response['Parameter']:
            desiredCapacity = response['Parameter']['Value']
            print("In kda scaler, desiredCapacity: " + str(desiredCapacity))
    else:
        # if I do not have an entry in ParameterStore, I assume that the desiredCapacity = actualCapacity
        desiredCapacity = actualCapacity

    if applicationStatus == "UPDATING":
        scalingStatus = "InProgress"
    elif applicationStatus == "RUNNING":
        scalingStatus = "Successful"

    print("In kda scaler, scalingStatus: " + scalingStatus)

    if event['httpMethod'] == "PATCH":

        # Check whether autoscaling is calling to change the Desired Capacity
        if 'desiredCapacity' in event['body']:
            desiredCapacityBody = json.loads(event['body'])
            desiredCapacityBody = desiredCapacityBody['desiredCapacity']

            # Check whether the new desired capacity is negative. If so, I need to calculate the new desired capacity
            if int(desiredCapacityBody) >= 0:
                desiredCapacity = desiredCapacityBody

                # Store the new desired capacity in a ParameterStore
                response = client_ssm.put_parameter(
                    Name=PARAMETER_STORE,
                    Value=str(int(desiredCapacity)),
                    Type='String',
                    Overwrite=True
                )
                print(response)
                print("In kda scaler, trying to set capacity to " + str(desiredCapacity))

                if scalingStatus == "Successful" and int(desiredCapacity) != int(actualCapacity):
                    scalingStatus = update_parallelism(context, desiredCapacity, resourceName, appVersion)
            else:
                print("desiredCapacity was < 0")

    elif event['httpMethod'] == "GET":
        if scalingStatus == "Successful" and int(desiredCapacity) != int(actualCapacity):
            scalingStatus = update_parallelism(context, desiredCapacity, resourceName, appVersion)
        elif scalingStatus == "Successful":
            print("Scaling successful; not doing anything")
    
    else:
        print("Unknown http method!: " + event['httpMethod'])

    # Do NOT change the version in response!
    # Doing so will cause the scalable target
    # to get unregistered along with the attached
    # scaling policies.
    returningJson = {
        "actualCapacity": float(actualCapacity),
        "desiredCapacity": float(desiredCapacity),
        "dimensionName": resourceName,
        "resourceName": resourceName,
        "scalableTargetDimensionId": resourceName,
        "scalingStatus": scalingStatus,
        "version": "KDAScaling"
    }

    try:
        returningJson['failureReason'] = failureReason
    except:
        pass

    print(returningJson)

    return response_function(200, returningJson)
    
def get_how_to_treat_missing_data(curr_capacity):
    return "breaching" if curr_capacity > 1 else "missing"
    