---
title: "Connect to Windows desktop"
chapter: false
weight: 30
---

1. Start the Remote Desktop Client and click **Add Desktop**

1. Enter the public ip address of the EC2 instance you obtained from the output section of the CloudFormation template and confirm with **Add**

	![Lauch stack](/images/flink-on-kda/remote-desktop-1-create.png)

1. Double click on the desktop icon and enter `Administrator` as **Username** and the password you've retrieved earlier form the output section of the CloudFormatino template as **Password**

	![Lauch stack](/images/flink-on-kda/remote-desktop-2-credentials.png)

1. When prompted if you want to continue with the warning that the root certificate couldn't be verified, press **Continue**
