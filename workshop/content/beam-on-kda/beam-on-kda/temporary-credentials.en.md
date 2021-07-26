+++
title = "Leveraging temporary credentials"
menuTitle = "Temporary credentials"
date = 2020-07-10T10:27:19+02:00
weight = 20
chapter = false
+++

You can configure your Beam IO connectors to pull temporary credentials from the KDA environment. Here's a snippet illustrating how to configure the `KinesisIO` connector.


{{< highlight java >}}
input = p
    .apply("Kinesis source", KinesisIO
        .read()
        .withAWSClientsProvider(new DefaultCredentialsProviderClientsProvider())
        ...
    )
{{< / highlight >}}

Leveraging temporary credentials has the advantage that you don't need to hard coding credentials in your code. Instead, you access permissions for an [IAM Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) that is then associated with your KDA application. The temporary credentials are then exposed through the evenvironment and will be automatically picked up by the `DefaultCredentialsProviderClientsProvider`.