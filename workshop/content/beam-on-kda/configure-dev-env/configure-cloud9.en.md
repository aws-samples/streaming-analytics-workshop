---
title: "Configure AWS Cloud9"
chapter: false
weight: 21
---

The AWS Cloud9 development environment is created for you as part of the CloudFormation template. You have to complete the configuration of the environment by following the steps below:

1. Navigate to the [CloudFormation console](https://console.aws.amazon.com/cloudformation/home) and select the correct CloudFormation stack. If you are running the workshop on your own the Stack is called **beam-workshop** and if you are attending an AWS hosted event, there is only one Stack available in the account. Click on the output tab and copy the calue for Cloud9DevEnvironmentProfileName and Cloud9DevEnvironmentTag properties (highlighted in the picture below).

   ![Lauch stack](/images/beam-on-kda/cfn_c9_output.png)

2. Open AWS CloudShell by choosing the following options available on the navigation bar:
- Choose the AWS CloudShell icon.
- Start typing "cloudshell" in Search box and then choose the CloudShell option.

3. Replace the place holder values within <> with the values you copied in Step 1. The tag value is a multi-part string separated by ':'. Please copy only the last part of the string.

```bash
export tag_value='<REPLACE THIS TEXT WITH THE LAST PART OF Cloud9DevEnvironmentTag VALUE>'
export instance_profile_name='<REPLACE THIS TEXT WITH Cloud9DevEnvironmentProfileName VALUE>'

export instance_id=`aws ec2 describe-instances \
 	--filters "Name=tag-value, Values=$tag_value" \
 	--query "Reservations[].Instances[].InstanceId" --output text`

aws ec2 associate-iam-instance-profile --iam-instance-profile Name=$instance_profile_name --instance-id $instance_id
```

4. The output should look like the following:
```json
{
    "IamInstanceProfileAssociation": {
        "AssociationId": "iip-assoc-032d69fed92042104",
        "InstanceId": "i-0eb427a9a16d8f9f9",
        "IamInstanceProfile": {
            "Arn": "arn:aws:iam::xxxxxxxxxxxx:instance-profile/beam-workshop-devenv-profile",
            "Id": "AIPAS7TKGBPA7RLYJPAAW"
        },
        "State": "associating"
    }
}
```
