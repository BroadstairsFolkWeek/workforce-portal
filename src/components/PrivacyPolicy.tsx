import PageLayout from "./PageLayout";

const PrivacyPolicy: React.FC = () => {
  return (
    <PageLayout>
      <h1 className="mt-4 text-2xl font-black">Privacy Policy</h1>
      <p className="my-2">
        This version of our privacy policy was last updated on 10th June 2022
        and applies to the Broadstairs Folk Week Workforce Portal and the
        information user provide using the portal.
      </p>

      <p>
        This policy is an extension of Broadstairs Folk Week’s general privacy
        policy which can be viewed at
        <a href="https://broadstairsfolkweek.org.uk/privacy-policy/">
          https://broadstairsfolkweek.org.uk/privacy-policy/
        </a>
      </p>

      <h1 className="mt-4 text-2xl font-black">About us</h1>
      <p className="my-2">
        We are Broadstairs Folk Week, registered charity no. 1104684.
      </p>
      <p className="my-2">
        Our website address is{" "}
        <a href="https://broadstairsfolkweek.org.uk/">
          https://broadstairsfolkweek.org.uk/
        </a>
      </p>
      <p className="my-2">
        Our address is: Broadstairs Folk Week, Kent Innovation Centre,
        Millennium Way, Broadstairs, Kent. CT10 2QQ
      </p>
      <p className="my-2">
        Our other contact details are: <br />
        Telephone: 01843 604080 <br />
        Fax: 01843 866422
        <br />
        Email: info@broadstairsfolkweek.org.uk
      </p>

      <h1 className="mt-4 text-2xl font-black">About the workforce portal</h1>
      <p className="my-2">
        The workforce portal is a web application intended to mange the
        relationship between Broadstairs Folk Week and members of its volunteer
        workforce.
      </p>
      <p className="my-2">
        The current version of the workforce portal includes functionality where
        visitors can fill in an online application form, provide contact details
        and upload ID Badge photos as part of their application to join the
        volunteer workforce.
      </p>
      <p className="my-2">
        The aim of this online application process is to ensure provided
        information is complete and valid prior to submission, and to reduce the
        steps involved in submitting an application when compared to paper-based
        forms.
      </p>
      <p className="my-2">
        Future versions of the workforce portal are expected to allow a
        volunteer to view their assigned shifts and to provide a method of
        contact between a volunteer and their shift manager.
      </p>
      <p className="my-2">
        Use of profile photos will aid recognition between members of the
        volunteer workforce working together at one of the many Broadstairs Folk
        Week venues.
      </p>
      <p className="my-2">
        Users of the workforce portal need to authenticate (sign-in) to submit
        their workforce application and to view other information relevant to
        their relationship with Broadstairs Folk Week.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        Personal information we collect
      </h1>
      <p className="my-2">
        Certain personal information is collected within the workforce portal
        and submitted to Broadstairs Folk Week as part of an application to join
        the volunteer workforce.
      </p>
      <p className="my-2">
        Personal information is collected in the workforce portal in four
        distinct stages.
      </p>

      <h2 className="mt-2 text-xl font-black">Initial authentication stage</h2>
      <p className="my-2">
        To use the workforce portal, a user must authenticate (sign-in) to the
        portal.
      </p>
      <p className="my-2">
        The portal allows users to sign in with an email and password that they
        register with the portal, or to sign in with Identity Providers such as
        Facebook and Twitter.
      </p>
      <p className="my-2">
        If the user registers an email address and password, they will also be
        prompted to provide a Display Name. This is the name they want to appear
        as in the workforce portal.
      </p>
      <p className="my-2">
        If the user signs in with an Identity Provider, their display name will
        be read from the Identity Provider. In this case, the first time the
        user signs in with the identity provider, they will be prompted to
        provide and validate their email address.
      </p>
      <p className="my-2">
        The user’s email address is collected to ensure Broadstairs Folk Week
        have a consistent method of communicating with their volunteer workforce
        applicants.
      </p>
      <p className="my-2">
        In summary, personal information collected during the initial
        authentication stage is:
        <ul className="ml-8 list-disc">
          <li>Email address</li>
          <li>Display name</li>
          <li>
            If using an Identity Provider such as Facebook or Twitter, the
            user’s account name on that service.
          </li>
        </ul>
      </p>

      <h2 className="mt-2 text-xl font-black">Profile stage</h2>
      <p className="my-2">
        This is personal information which can be expected to remain the same
        over a long period of time, for example your name and address. When a
        portal user submits their application to join the volunteer workforce
        for a Broadstairs Folk Week event, the current version of their profile
        information will be included as part of that application.
      </p>
      <p className="my-2">
        The workforce portal will prompt users to provide the following
        information as part of their profile:
        <ul className="ml-8 list-disc">
          <li>Given (first) name</li>
          <li>Surname</li>
          <li>Address</li>
          <li>Telephone</li>
        </ul>
      </p>
      <p className="my-2">
        The above information is collected to allow Broadstairs Folk Week to
        identify and contact volunteer workforce applicants.
      </p>
      <p className="my-2">
        Users can amend and save profile information at any time, including
        blanking out individual pieces of profile information. Saved changes to
        the profile will be updated in the portal’s data storage immediately.
      </p>

      <h2 className="mt-2 text-xl font-black">Profile photo stage</h2>
      <p className="my-2">
        Before a user can submit a workforce application, they will need to
        upload a profile photo.
      </p>
      <p className="my-2">
        The profile photo will be used to create the ID badge that must be worn
        by all workforce members during Broadstairs Folk Week events.
      </p>
      <p className="my-2">
        Photos can be uploaded as a file or can be captured using the camera on
        the user’s device (computer/tablet/phone/etc).
      </p>
      <p className="my-2">Multiple photos can be uploaded.</p>
      <p className="my-2">
        Users can delete photos using the workforce portal. Photos will be
        removed immediately from the portal’s data storage immediately.
      </p>

      <h2 className="mt-2 text-xl font-black">Application stage</h2>
      <p className="my-2">
        Users can create an application to join the volunteer workforce and
        provide information requested as part of the application process.
      </p>
      <p className="my-2">
        Users can save the application at any time without submitting it for
        consideration by Broadstairs Folk Week.
      </p>
      <p className="my-2">
        The workforce portal will prompt users to provide the following personal
        information during the application stage:
        <ul className="ml-8 list-disc">
          <li>Age group </li>
          <li>Names of individuals the user would like to volunteer with</li>
          <li>Occupation</li>
          <li>T-shirt size</li>
          <li>Emergency contact name and phone number. </li>
          <li>
            If the user would be unable to perform certain aspects of a role or
            would need extra support. This might be the case if the user has a
            disability.{" "}
          </li>
          <li>Any other information the user wishes to provide. </li>
        </ul>
      </p>
      <p className="my-2">
        Users can amend and save the application’s information at any time,
        including blanking out individual pieces of information. Saved changes
        to an application will be updated in the portal’s data storage
        immediately.
      </p>
      <p className="my-2">
        Users can delete the entire application, immediately removing it from
        the portal’s data storage.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        How information collected by the workforce portal will be used
      </h1>
      <p className="my-2">
        Once a user has provided all information required for an application,
        they can Submit the application for consideration by Broadstairs Folk
        Week.
      </p>
      <p className="my-2">
        Submitted applications, including a copy of the most recent profile
        information and photo are copied from the workforce portal to an
        internal database used by Broadstairs Folk Week staff to manage the
        volunteer workforce.
      </p>
      <p className="my-2">
        If an application to join the workforce is unsuccessful, the author of
        the application shall be notified by email and details of the
        application are deleted from the internal database.
      </p>
      <p className="my-2">
        If an application to join the workforce is successful, the author of the
        application shall be notified by email and details of the application
        will be maintained on the internal database for the purpose of
        administering the activities of the workforce.
      </p>
      <p className="my-2">
        In both above cases, if the application was submitted via the workforce
        portal, then the user shall be able to review the contents of the
        application from within the portal.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        Information related to children
      </h1>
      <p className="my-2">
        Normally only individuals aged 18 years or over can apply to join the
        workforce. Applicants will need to select their age group during the
        application process. The youngest age selectable is 18.
      </p>
      <p className="my-2">
        The workforce portal is not for use by individuals under the age of 18.
      </p>
      <p className="my-2">
        In certain circumstances, individuals aged 17 may apply to join the
        workforce, but they will need to contact Broadstairs Folk Week directly
        and cannot submit their application using the workforce portal.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        Persons with access to information held in the workforce portal
      </h1>
      <p className="my-2">
        All information collected by the workforce portal is accessible to the
        developers of the workforce portal and to Broadstairs Folk Week staff.
      </p>
      <p className="my-2">
        The portal has been developed by Watford Consulting Ltd. Developers have
        access to this information to allow further development of the portal
        and to assist Broadstairs Folk Week staff in managing the information
        from the portal.
      </p>
      <p className="my-2">
        Broadstairs Folk Week staff have access to information in the portal to
        monitor applications and transfer information from submitted
        applications to the internal management database.
      </p>
      <p className="my-2">
        Where an application to join the volunteer workforce is successful,
        contact information for the volunteer will be made available to
        individuals assigned management or supervisory roles for the volunteer,
        including individuals with authority or responsibility for the overall
        running of an event. This ensures that Broadstairs Folk Week can attempt
        to contact volunteers in the event of absence from or change requests to
        volunteer assignments.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        How information is stored by the workforce portal
      </h1>
      <p className="my-2">
        The workforce portal is a web application hosted in Microsoft Azure.
      </p>
      <p className="my-2">
        Broadstairs Folk Week’s Microsoft 365 tenant is used as the data store
        for the portal. Access to data within the Microsoft 365 tenant is
        restricted to Broadstairs Folk Week staff and to the portal developers.
      </p>

      <h1 className="mt-4 text-2xl font-black">How information is protected</h1>
      <p className="my-2">
        Information collected by the workforce portal is stored within
        Broadstairs Folk Week’s Microsoft 365 tenant.
      </p>
      <p className="my-2">
        Access to this information is restricted to authorised Microsoft 365
        accounts and the workforce portal website. Authorised accounts are those
        belonging to Broadstairs Folk Week staff and to the portal software
        developers, Watford Consulting Ltd.
      </p>
      <p className="my-2">
        Where an application to join the volunteer workforce is submitted,
        information related to the application is copied to an internal
        management database held on Broadstairs Folk Week premises. Access to
        this database is restricted to Broadstairs Folk Week staff.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        Information shared with third parties
      </h1>
      <p className="my-2">
        Contact information may be shared with other volunteers during events
        for the purpose of managing volunteers.
      </p>
      <p className="my-2">
        No other information collected by the workforce portal is shared with
        third parties.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        Use of cookies and tracking technologies
      </h1>
      <p className="my-2">
        Cookies are used to enable authentication with the workforce portal. No
        tracking or marketing cookies are used by the workforce portal.
      </p>
      <p className="my-2">
        Identity providers such as Facebook and Twitter, if used for
        authentication with the workforce portal, will likely store cookies on
        your device to enable the authentication process. These are third-party
        services which may also store other types of cookies on your device. See
        the privacy and cookie policies for these other services for more
        information.
      </p>

      <h1 id="howtodelete" className="mt-4 text-2xl font-black">
        How a user can delete their information from the workforce portal
      </h1>
      <p className="my-2">
        If a user wishes to remove some aspect of their personal information
        from the workforce portal, then they can delete individual profile
        photos, and clear individual fields from the profile and application
        forms.
      </p>
      <p className="my-2">
        If a user wishes to remove all information about themselves stored in
        the portal then this can be achieved using the Remove my information
        button on the Edit Profile screen in the portal.
      </p>
      <p className="my-2">
        If a user has already submitted an application to join the volunteer
        workforce then information related to their application may have already
        been transferred to the internal management database. The application
        process will continue as if the user had submitted the application
        through some other process such as a postal application form.
      </p>
      <p className="my-2">
        If the user wishes to have information related to a submitted
        application deleted, then they should contain Broadstairs Folk Week
        using any of the contact information listed at the start of this policy
        document.
      </p>

      <h1 className="mt-4 text-2xl font-black">
        How privacy policy changes are handled
      </h1>
      <p className="my-2">
        If Broadstairs Folk Week intend to make material changes to this privacy
        policy, then advanced notification will be sent to all registered users
        via the email address they provided during the registration process.
      </p>
      <p className="my-2">
        The notification shall highlight the difference in the new privacy
        policy compared to the current privacy policy.
      </p>
      <p className="my-2">
        Notification of privacy policy changes shall be sent at least 14 days
        prior to enacting any change, ensuring users have opportunity to delete
        their information from the portal if they do not consent to new policy.
      </p>
    </PageLayout>
  );
};

export default PrivacyPolicy;
