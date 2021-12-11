---
title: "2. Environment Set Up"
chapter: false
disableToc: false
menuTitle: "Environment Set Up"
weight: 10
---

We will need to deploy a few services and configure our AWS environment before we can get started developing Flink applications.

We will need to compelete the following set up steps

1. Create a Kinesis Data Stream
2. Create an S3 Bucket + Upload Sample Data
3. Create a KDA Studio + Upload Notebooks
4. Update IAM Role Premissions

Follow the instructions below for each step

#### Create a Kinesis Data Stream 

1. Go to the [Kinesis Console](https://console.aws.amazon.com/kinesis/home)
2. Under data steams click on **Create a Data Stream**
3. Enter a name for the Kinesis Data Stream ```yellow-cab-trip```
4. Leave all other settings as is and click on **Create data stream**

#### Create an S3 Bucket

1. Go to the [S3 Console](https://s3.console.aws.amazon.com/s3/home)
2. Click on **Create bucket**
3. Enter a name for the bucket. You may name the bucket anything. Record the name of the bucket we will need it later in the workshop
4. Leave all other settings as is and click on **Create Bucket**


#### Upload Sample Data to S3

1. Download the [vendor_ref.csv](https://sharkech-public.s3.amazonaws.com/flink-on-kda/vendor_ref.csv) 
2. Download the [yellow_tripdata_2020-01_noHeader.csv](https://sharkech-public.s3.amazonaws.com/flink-on-kda/yellow_tripdata_2020-01_noHeader.csv)
3. Go to the [S3 Console](https://s3.console.aws.amazon.com/s3/home)
4. Click on the bucket you just created
5. Click on create folder and create a folder named ```reference_data```
6. In the folder upload the vendor_ref.csv and yellow_tripdata_2020-01_noHeader.csv

The final output has the vendor_ref.csv and yellow_tripdata_2020-01_noHeader.csv uploaded to the reference_data folder in S3

![S3_final_view](/images/flink-on-kda-studio/S3_final_view.png)

#### Create a KDA Studio

1. Go to the [Kinesis Data Analytics Console](https://console.aws.amazon.com/kinesisanalytics/home)
2. Click on **Studio**
3. Click on **Create Studio notebook**

![KDA_Stuio](/images/flink-on-kda-studio/studio_set_up.png)

4. Click on **Create with custom settings** under the creation method section
5. Enter a studio notebook name. You may name the studio notebook anything
6. Select ```Apache Flink 1.13, Apache Zeppelin 0.9```
7. Click on **Next**
8. Under the IAM role section, select ```Create / update IAM role ... with required policies```. Record the name of the IAM role
9. Under the AWS Glue database, click on **Create**. This will open a new tab/window in your web browser
10. In the new window opened click on **Add database**

![Glue_Create_Database](/images/flink-on-kda-studio/glue_catalog.png)

11. Enter a database name. You may name the database anything
12. Click on **Create**

![Glue_Name_Database](/images/flink-on-kda-studio/glue_name_database.png)

13. Close the browser window and return to the brower window that you were previously configuring the KDA studio deployment in
14. Under the AWS Glue Database section click on the small refresh button and select the database you just created from the drop down

![Glue_Database_Select](/images/flink-on-kda-studio/glue_database_select.png)

15. Leave the rest of the settings with the default configurations and click on **Next** at the bottom of the screen
16. Under the Deploy as application configuration - *optional* section, click on **Browse** and select the S3 bucket you created earlier
17. Leave the rest of the setting with the default configurations and click on **Next** at the bottom of the screen
18. Click on **Create Studio notebook** at the bottom of the screen

#### Update IAM Role Premissions

1. Go to the [IAM Console Roles](https://console.aws.amazon.com/iamv2/home?#/roles)
2. Search for the name of the role that you created earlier during the KDA studion creation. You created this role during step 9 of the Create a KDA Studio section

Different from what is pictured below you will need to search for the name of the role you created in step 9 of the Create a KDA Studio section

![Glue_Database_Select](/images/flink-on-kda-studio/select_IAM.png)

3. Click on **Attach polocies**

![Glue_Database_Select](/images/flink-on-kda-studio/attach_policies.png)

4. Search for and add ```AmazonS3FullAccess```, ```AmazonKinesisFullAccess``` and ```AWSGlueServiceRole```

The environment set up is now complete. When you are ready procede to the next step [Send Data to Kinesis Data Stream]({{<relref "../3_Send_Data_to_Kinesis_Data_Stream/">}})