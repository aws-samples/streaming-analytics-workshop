---
title: "Install Apache Maven"
chapter: false
weight: 22
---

1. Navigate to the [AWS Cloud9 console](https://console.aws.amazon.com/cloud9/home).If you are running the workshop on your own the environment is called **beam-workshop-devenv** and if you are attending an AWS hosted event, there is only one development environment available in the account. Once you have found the development environment, click on the "Open Ide" button.

2. The code [repository](https://github.com/aws-samples/amazon-kinesis-analytics-beam-taxi-consumer.git") is automatically cloned into your environment the first time you open the IDE.

3. Open a terminal window and execute the following commands to install Apache Maven.
```bash
sudo wget https://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo
sudo sed -i s/\$releasever/6/g /etc/yum.repos.d/epel-apache-maven.repo
sudo yum install -y apache-maven

sudo rpm --import https://yum.corretto.aws/corretto.key 
sudo curl -L -o /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo
sudo yum install -y java-11-amazon-corretto-devel
alias java="/usr/lib/jvm/java-11-amazon-corretto/bin/java"
```